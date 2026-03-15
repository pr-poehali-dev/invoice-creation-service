"""Telegram-бот Sweep: создание счетов, управление, отправка PDF"""
import json
import os
import uuid
import psycopg2
import requests
from datetime import datetime, date, timedelta
from pdf_generator import generate_invoice_pdf

DB   = os.environ["DATABASE_URL"]
SCH  = os.environ.get("MAIN_DB_SCHEMA", "t_p48002676_invoice_creation_ser")
TG   = os.environ["TELEGRAM_BOT_TOKEN"]
API  = f"https://api.telegram.org/bot{TG}"

CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

# ─── DB helpers ───────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(DB)

def upsert_session(chat_id: int, state: str, data: dict):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCH}.tg_sessions (chat_id, state, data, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (chat_id) DO UPDATE
                    SET state = EXCLUDED.state, data = EXCLUDED.data, updated_at = NOW()""",
                (chat_id, state, json.dumps(data))
            )

def get_session(chat_id: int) -> dict:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT state, data FROM {SCH}.tg_sessions WHERE chat_id = %s", (chat_id,))
            row = cur.fetchone()
            if row:
                return {"state": row[0], "data": row[1] if isinstance(row[1], dict) else json.loads(row[1])}
            return {"state": "idle", "data": {}}

def get_clients() -> list:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id, name, company, inn FROM {SCH}.clients ORDER BY name LIMIT 20")
            return [{"id": str(r[0]), "name": r[1], "company": r[2] or "", "inn": r[3] or ""} for r in cur.fetchall()]

def create_client(name: str, company: str = "", inn: str = "", phone: str = "") -> str:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cid = str(uuid.uuid4())
            cur.execute(
                f"INSERT INTO {SCH}.clients (id, name, company, inn, phone) VALUES (%s, %s, %s, %s, %s)",
                (cid, name, company, inn, phone)
            )
            return cid

def get_invoices(limit=10) -> list:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, number, client_name, total, status, created_at FROM {SCH}.invoices ORDER BY created_at DESC LIMIT %s",
                (limit,)
            )
            return [{"id": str(r[0]), "number": r[1], "client_name": r[2], "total": float(r[3]), "status": r[4], "created_at": r[5]} for r in cur.fetchall()]

def get_invoice_by_id(inv_id: str) -> dict | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id, number, client_name, client_email, items, total, status, note, due_date, created_at FROM {SCH}.invoices WHERE id = %s", (inv_id,))
            r = cur.fetchone()
            if not r:
                return None
            return {"id": str(r[0]), "number": r[1], "client_name": r[2], "client_email": r[3] or "",
                    "items": r[4] if isinstance(r[4], list) else json.loads(r[4] or "[]"),
                    "total": float(r[5]), "status": r[6], "note": r[7], "due_date": r[8], "created_at": r[9]}

def save_invoice(inv: dict) -> str:
    with get_conn() as conn:
        with conn.cursor() as cur:
            inv_id = str(uuid.uuid4())
            num = f"СВП-{datetime.now().year}-{datetime.now().strftime('%m%d%H%M')}"
            cur.execute(
                f"""INSERT INTO {SCH}.invoices (id, number, client_name, client_email, items, total, status, note, due_date)
                    VALUES (%s,%s,%s,%s,%s,%s,'sent',%s,%s)""",
                (inv_id, num, inv["client_name"], inv.get("client_email",""),
                 json.dumps(inv["items"]), inv["total"], inv.get("note",""),
                 inv.get("due_date"))
            )
            inv["id"] = inv_id
            inv["number"] = num
            return inv_id

def update_status(inv_id: str, status: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE {SCH}.invoices SET status=%s, updated_at=NOW() WHERE id=%s", (status, inv_id))

# ─── Telegram API helpers ──────────────────────────────────────────────────────

def send(chat_id, text, reply_markup=None, parse_mode="HTML"):
    payload = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    if reply_markup:
        payload["reply_markup"] = json.dumps(reply_markup)
    requests.post(f"{API}/sendMessage", json=payload, timeout=10)

def send_doc(chat_id, file_bytes, filename, caption=""):
    requests.post(
        f"{API}/sendDocument",
        data={"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"},
        files={"document": (filename, file_bytes, "application/pdf")},
        timeout=30
    )

def answer_callback(callback_id, text=""):
    requests.post(f"{API}/answerCallbackQuery", json={"callback_query_id": callback_id, "text": text}, timeout=5)

def edit_msg(chat_id, msg_id, text, reply_markup=None):
    payload = {"chat_id": chat_id, "message_id": msg_id, "text": text, "parse_mode": "HTML"}
    if reply_markup:
        payload["reply_markup"] = json.dumps(reply_markup)
    requests.post(f"{API}/editMessageText", json=payload, timeout=10)

def main_menu_kb():
    return {"inline_keyboard": [
        [{"text": "📄 Создать счёт",    "callback_data": "new_invoice"}],
        [{"text": "📋 Мои счета",       "callback_data": "list_invoices"},
         {"text": "👥 Клиенты",         "callback_data": "list_clients"}],
        [{"text": "📊 Статистика",      "callback_data": "stats"}],
    ]}

STATUS_NAMES = {"draft": "Черновик", "sent": "Отправлен", "paid": "✅ Оплачен", "overdue": "⚠️ Просрочен"}
STATUS_EMOJI = {"draft": "📝", "sent": "📤", "paid": "✅", "overdue": "⚠️"}

# ─── Flow handlers ─────────────────────────────────────────────────────────────

def handle_new_invoice(chat_id, session):
    clients = get_clients()
    if not clients:
        upsert_session(chat_id, "new_inv:client_name", {})
        send(chat_id, "У вас пока нет клиентов.\n\n✏️ Введите <b>имя клиента</b> (или компанию):")
        return
    kb_rows = [[{"text": f"👤 {c['name']}" + (f" ({c['company']})" if c['company'] else ""), "callback_data": f"pick_client:{c['id']}:{c['name']}"}] for c in clients]
    kb_rows.append([{"text": "➕ Новый клиент", "callback_data": "new_client"}])
    kb_rows.append([{"text": "◀️ Назад", "callback_data": "start"}])
    upsert_session(chat_id, "new_inv:pick_client", {})
    send(chat_id, "👤 Выберите клиента или создайте нового:", {"inline_keyboard": kb_rows})

def handle_text(chat_id: int, text: str, session: dict):
    state = session["state"]
    data  = session["data"]

    if state == "new_inv:client_name":
        data["client_name"] = text
        upsert_session(chat_id, "new_inv:service", data)
        send(chat_id, f"Клиент: <b>{text}</b>\n\n✏️ Введите наименование услуги/товара:")

    elif state == "new_inv:service":
        data["current_item"] = {"description": text}
        upsert_session(chat_id, "new_inv:price", data)
        send(chat_id, f"Услуга: <b>{text}</b>\n\n💰 Введите цену (в рублях, только цифры):")

    elif state == "new_inv:price":
        try:
            price = float(text.replace(",", ".").replace(" ", ""))
        except ValueError:
            send(chat_id, "❌ Введите число, например: <b>5000</b>")
            return
        data["current_item"]["price"] = price
        upsert_session(chat_id, "new_inv:qty", data)
        send(chat_id, f"Цена: <b>{price:,.0f} ₽</b>\n\n🔢 Введите количество (например: <b>1</b>):")

    elif state == "new_inv:qty":
        try:
            qty = int(text.strip())
        except ValueError:
            send(chat_id, "❌ Введите целое число, например: <b>1</b>")
            return
        item = data["current_item"]
        item["quantity"] = qty
        item["id"] = str(uuid.uuid4())
        data.setdefault("items", []).append(item)
        total = sum(i["price"] * i["quantity"] for i in data["items"])
        data["total"] = total
        lines = "\n".join([f"  • {i['description']} × {i['quantity']} = {i['price']*i['quantity']:,.0f} ₽" for i in data["items"]])
        upsert_session(chat_id, "new_inv:more", data)
        send(chat_id, f"✅ Добавлено!\n\n<b>Позиции счёта:</b>\n{lines}\n\n<b>Итого: {total:,.0f} ₽</b>\n\nДобавить ещё позицию?", {
            "inline_keyboard": [
                [{"text": "➕ Добавить позицию", "callback_data": "add_item"}],
                [{"text": "✅ Выставить счёт",   "callback_data": "confirm_invoice"}],
                [{"text": "❌ Отмена",           "callback_data": "start"}],
            ]
        })

    elif state == "new_inv:due_date":
        try:
            d = datetime.strptime(text.strip(), "%d.%m.%Y").date()
        except ValueError:
            send(chat_id, "❌ Формат: <b>ДД.ММ.ГГГГ</b>, например 25.04.2026")
            return
        data["due_date"] = d.isoformat()
        _finalize_invoice(chat_id, data)

    else:
        send(chat_id, "Привет! Выберите действие:", main_menu_kb())
        upsert_session(chat_id, "idle", {})

def _finalize_invoice(chat_id: int, data: dict):
    inv_id = save_invoice(data)
    inv = get_invoice_by_id(inv_id)
    send(chat_id, f"⏳ Генерирую PDF счёта <b>{inv['number']}</b>...")
    try:
        pdf = generate_invoice_pdf(inv)
        send_doc(
            chat_id, pdf,
            f"{inv['number']}.pdf",
            f"✅ <b>Счёт {inv['number']}</b>\n👤 {inv['client_name']}\n💰 {inv['total']:,.0f} ₽\n📅 до {inv.get('due_date','—')}"
        )
    except Exception as e:
        send(chat_id, f"⚠️ PDF не удалось сгенерировать: {e}\nСчёт сохранён в системе как <b>{inv['number']}</b>")

    upsert_session(chat_id, "idle", {})
    send(chat_id, "Что дальше?", main_menu_kb())

def handle_callback(chat_id: int, msg_id: int, cb_id: str, data_str: str, session: dict):
    answer_callback(cb_id)
    data = session["data"]

    if data_str == "start":
        upsert_session(chat_id, "idle", {})
        edit_msg(chat_id, msg_id, "🏠 Главное меню Sweep:", main_menu_kb())

    elif data_str == "new_invoice":
        handle_new_invoice(chat_id, session)

    elif data_str == "new_client":
        upsert_session(chat_id, "new_inv:client_name", {})
        send(chat_id, "✏️ Введите имя нового клиента:")

    elif data_str.startswith("pick_client:"):
        parts = data_str.split(":", 2)
        data["client_id"]   = parts[1]
        data["client_name"] = parts[2]
        upsert_session(chat_id, "new_inv:service", data)
        send(chat_id, f"Клиент: <b>{parts[2]}</b>\n\n✏️ Введите наименование услуги/товара:")

    elif data_str == "add_item":
        upsert_session(chat_id, "new_inv:service", data)
        send(chat_id, "✏️ Введите наименование следующей услуги/товара:")

    elif data_str == "confirm_invoice":
        upsert_session(chat_id, "new_inv:due_date", data)
        default = (date.today() + timedelta(days=14)).strftime("%d.%m.%Y")
        send(chat_id, f"📅 Введите срок оплаты в формате <b>ДД.ММ.ГГГГ</b>\n(или просто отправьте дату, например <b>{default}</b>):")

    elif data_str == "list_invoices":
        invs = get_invoices(8)
        if not invs:
            send(chat_id, "📭 Счетов пока нет.", main_menu_kb())
            return
        kb = [[{"text": f"{STATUS_EMOJI.get(i['status'],'📄')} {i['number']} · {i['client_name'][:16]} · {i['total']:,.0f}₽", "callback_data": f"inv:{i['id']}"}] for i in invs]
        kb.append([{"text": "◀️ Назад", "callback_data": "start"}])
        send(chat_id, "📋 <b>Последние счета:</b>", {"inline_keyboard": kb})

    elif data_str.startswith("inv:"):
        inv_id = data_str[4:]
        inv = get_invoice_by_id(inv_id)
        if not inv:
            send(chat_id, "Счёт не найден.")
            return
        st = STATUS_NAMES.get(inv["status"], inv["status"])
        txt = (f"📄 <b>{inv['number']}</b>\n"
               f"👤 {inv['client_name']}\n"
               f"💰 {inv['total']:,.0f} ₽\n"
               f"📌 Статус: {st}\n"
               f"📅 Срок: {inv.get('due_date') or '—'}")
        kb = {"inline_keyboard": [
            [{"text": "📥 Скачать PDF", "callback_data": f"pdf:{inv_id}"}],
            [{"text": "✅ Отметить оплаченным", "callback_data": f"status:{inv_id}:paid"}],
            [{"text": "📤 Отправлен",           "callback_data": f"status:{inv_id}:sent"}],
            [{"text": "⚠️ Просрочен",           "callback_data": f"status:{inv_id}:overdue"}],
            [{"text": "◀️ К списку",            "callback_data": "list_invoices"}],
        ]}
        send(chat_id, txt, kb)

    elif data_str.startswith("pdf:"):
        inv_id = data_str[4:]
        inv = get_invoice_by_id(inv_id)
        if not inv:
            send(chat_id, "Счёт не найден.")
            return
        send(chat_id, f"⏳ Генерирую PDF...")
        try:
            pdf = generate_invoice_pdf(inv)
            send_doc(chat_id, pdf, f"{inv['number']}.pdf",
                     f"📄 <b>{inv['number']}</b> · {inv['client_name']} · {inv['total']:,.0f} ₽")
        except Exception as e:
            send(chat_id, f"⚠️ Ошибка генерации PDF: {e}")

    elif data_str.startswith("status:"):
        _, inv_id, new_status = data_str.split(":")
        update_status(inv_id, new_status)
        inv = get_invoice_by_id(inv_id)
        send(chat_id, f"✅ Статус счёта <b>{inv['number']}</b> изменён на: <b>{STATUS_NAMES.get(new_status, new_status)}</b>", main_menu_kb())

    elif data_str == "list_clients":
        clients = get_clients()
        if not clients:
            send(chat_id, "👥 Клиентов пока нет.", main_menu_kb())
            return
        lines = "\n".join([f"  • <b>{c['name']}</b>" + (f" — {c['company']}" if c['company'] else "") + (f" (ИНН {c['inn']})" if c['inn'] else "") for c in clients])
        send(chat_id, f"👥 <b>Клиенты:</b>\n{lines}", main_menu_kb())

    elif data_str == "stats":
        invs = get_invoices(100)
        paid  = sum(i["total"] for i in invs if i["status"] == "paid")
        pend  = sum(i["total"] for i in invs if i["status"] == "sent")
        over  = sum(i["total"] for i in invs if i["status"] == "overdue")
        txt = (f"📊 <b>Статистика Sweep</b>\n\n"
               f"✅ Получено:   <b>{paid:,.0f} ₽</b>\n"
               f"📤 Ожидается: <b>{pend:,.0f} ₽</b>\n"
               f"⚠️ Просрочено: <b>{over:,.0f} ₽</b>\n"
               f"📄 Всего счетов: <b>{len(invs)}</b>")
        send(chat_id, txt, main_menu_kb())


# ─── Webhook handler ────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Обработчик вебхука Telegram-бота Sweep.
    Принимает обновления от Telegram и управляет созданием счетов, клиентов и PDF.
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    # Регистрация вебхука
    if event.get("httpMethod") == "GET":
        qs = event.get("queryStringParameters") or {}
        if qs.get("setup") == "1":
            host = event.get("headers", {}).get("host", "")
            url  = f"https://{host}/"
            r = requests.post(f"{API}/setWebhook", json={"url": url, "allowed_updates": ["message","callback_query"]}, timeout=10)
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"webhook": r.json()})}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"status": "Sweep TG Bot running"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 200, "headers": CORS, "body": "ok"}

    # Callback query (кнопки)
    if "callback_query" in body:
        cq      = body["callback_query"]
        chat_id = cq["message"]["chat"]["id"]
        msg_id  = cq["message"]["message_id"]
        cb_id   = cq["id"]
        data_str= cq.get("data", "")
        session = get_session(chat_id)
        handle_callback(chat_id, msg_id, cb_id, data_str, session)
        return {"statusCode": 200, "headers": CORS, "body": "ok"}

    # Обычное сообщение
    msg = body.get("message", {})
    if not msg:
        return {"statusCode": 200, "headers": CORS, "body": "ok"}

    chat_id = msg["chat"]["id"]
    text    = msg.get("text", "").strip()
    session = get_session(chat_id)

    if text in ("/start", "/menu"):
        upsert_session(chat_id, "idle", {})
        send(chat_id,
             "👋 Добро пожаловать в <b>Sweep</b>!\n\nСоздавайте счета, управляйте клиентами и получайте PDF прямо здесь.",
             main_menu_kb())
    elif text == "/invoices":
        handle_callback(chat_id, 0, "", "list_invoices", session)
    elif text == "/new":
        handle_new_invoice(chat_id, session)
    else:
        handle_text(chat_id, text, session)

    return {"statusCode": 200, "headers": CORS, "body": "ok"}
