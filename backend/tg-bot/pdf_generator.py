"""Генерация PDF счёта через ReportLab с поддержкой кириллицы"""
import io
import os
import tempfile
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER

LOGO_URL  = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/74927180-ad7e-4282-8b42-bb069cf38a4e.png"
STAMP_URL = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/e95b92dd-9ec9-4d53-8c1c-ab83b350edda.png"
SIGN_URL  = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/1e6df93a-5956-48d3-8fda-77ead1406915.png"

# Шрифты с поддержкой кириллицы — jsDelivr отдаёт чистый TTF
FONT_URLS = {
    "DejaVu":      "https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@2.37/ttf/DejaVuSans.ttf",
    "DejaVu-Bold": "https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@2.37/ttf/DejaVuSans-Bold.ttf",
}

SUPPLIER_NAME    = "ИП ИВЧЕНКО МАРАТ ВАЛЕНТИНОВИЧ"
SUPPLIER_INN     = "236000378430"
SUPPLIER_ADDRESS = "352129, КРАСНОДАРСКИЙ КРАЙ, Г ТИХОРЕЦК, УЛ ФАСТОВЦА, Д 140"
BANK_NAME        = "АО «ТБанк»"
BANK_BIK         = "044525974"
BANK_CORR        = "30101810145250000974"
BANK_ACC         = "40802810900008650283"

BLUE  = colors.HexColor("#1d4ed8")
DARK  = colors.HexColor("#0f1117")
GRAY  = colors.HexColor("#6b7280")
LGRAY = colors.HexColor("#9ca3af")
BG    = colors.HexColor("#f8faff")
RED   = colors.HexColor("#ef4444")
WHITE = colors.white

_fonts_registered = False

def _register_fonts():
    global _fonts_registered
    if _fonts_registered:
        return
    tmpdir = tempfile.gettempdir()
    for name, url in FONT_URLS.items():
        path = os.path.join(tmpdir, f"{name}.ttf")
        # Скачиваем заново если файла нет или он битый (не TTF сигнатура)
        need_download = True
        if os.path.exists(path):
            with open(path, "rb") as f:
                header = f.read(4)
            # Валидные TTF сигнатуры: \x00\x01\x00\x00 или 'true' или 'OTTO'
            if header in (b'\x00\x01\x00\x00', b'true', b'OTTO', b'ttcf'):
                need_download = False
        if need_download:
            r = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
            data = r.content
            # Проверяем что получили TTF, а не HTML
            if data[:4] not in (b'\x00\x01\x00\x00', b'true', b'OTTO', b'ttcf'):
                raise ValueError(f"Загруженный файл не является TTF-шрифтом: {url}")
            with open(path, "wb") as f:
                f.write(data)
        pdfmetrics.registerFont(TTFont(name, path))
    _fonts_registered = True


def _fetch_image(url: str):
    try:
        r = requests.get(url, timeout=8)
        return io.BytesIO(r.content)
    except Exception:
        return None


def _fmt_money(amount) -> str:
    try:
        val = float(amount)
        return f"{val:,.0f} руб.".replace(",", " ")
    except Exception:
        return "0 руб."


def _fmt_date(d) -> str:
    if not d:
        return "-"
    if hasattr(d, "strftime"):
        return d.strftime("%d.%m.%Y")
    parts = str(d).split("-")
    if len(parts) == 3:
        return f"{parts[2]}.{parts[1]}.{parts[0]}"
    return str(d)


def generate_invoice_pdf(invoice: dict) -> bytes:
    _register_fonts()

    F  = "DejaVu"
    FB = "DejaVu-Bold"

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=14*mm, bottomMargin=14*mm
    )

    W = A4[0] - 40*mm

    def st(name, **kw):
        base = dict(fontName=F, fontSize=9, leading=13, textColor=DARK)
        base.update(kw)
        return ParagraphStyle(name, **base)

    s_title  = st("title",  fontSize=18, fontName=FB, textColor=DARK)
    s_num    = st("num",    fontSize=9,  textColor=GRAY, fontName=F)
    s_bold   = st("bold",   fontSize=9,  fontName=FB)
    s_small  = st("small",  fontSize=8,  textColor=GRAY, fontName=F)
    s_xsmall = st("xsmall", fontSize=7,  textColor=LGRAY, fontName=F)
    s_right  = st("right",  alignment=TA_RIGHT, fontName=F)
    s_r_bold = st("rbold",  alignment=TA_RIGHT, fontName=FB)
    s_white  = st("white",  textColor=WHITE, fontName=FB, fontSize=10)
    s_th     = st("th",     textColor=WHITE, fontName=FB, fontSize=8, alignment=TA_CENTER)
    s_center = st("center", alignment=TA_CENTER, fontSize=8, textColor=GRAY, fontName=F)
    s_lbl_bl = st("lblbl",  fontName=FB, fontSize=7, textColor=BLUE, spaceAfter=3)
    s_lbl_gr = st("lblgr",  fontName=FB, fontSize=7, textColor=LGRAY, spaceAfter=3)

    story = []

    # ── HEADER ──────────────────────────────────────────────────────────
    logo_img = None
    logo_data = _fetch_image(LOGO_URL)
    if logo_data:
        logo_img = Image(logo_data, width=80, height=22)

    header_data = [[
        logo_img or Paragraph("Sweep", s_bold),
        Paragraph("СЧЁТ НА ОПЛАТУ", s_title)
    ]]
    header_tbl = Table(header_data, colWidths=[W * 0.5, W * 0.5])
    header_tbl.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (0, 0), "LEFT"),
        ("ALIGN",  (1, 0), (1, 0), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(header_tbl)

    meta_data = [
        [Paragraph(f"№ {invoice['number']}", s_num),
         Paragraph(f"Дата: {_fmt_date(invoice.get('created_at'))}", s_right)],
        [Paragraph("", s_small),
         Paragraph(f"Срок оплаты: {_fmt_date(invoice.get('due_date'))}", st("red_r", alignment=TA_RIGHT, fontName=FB, fontSize=8, textColor=RED))],
    ]
    meta_tbl = Table(meta_data, colWidths=[W * 0.5, W * 0.5])
    meta_tbl.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(meta_tbl)
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=5 * mm, spaceBefore=3 * mm))

    # ── ПОСТАВЩИК + БАНК ─────────────────────────────────────────────────
    sup_cell = [
        Paragraph("ПОСТАВЩИК", s_lbl_bl),
        Paragraph(SUPPLIER_NAME, s_bold),
        Paragraph(f"ИНН {SUPPLIER_INN}", s_small),
        Paragraph(SUPPLIER_ADDRESS, s_xsmall),
    ]
    bnk_cell = [
        Paragraph("БАНК ПОЛУЧАТЕЛЯ", s_lbl_bl),
        Paragraph(BANK_NAME, s_bold),
        Paragraph(f"БИК: {BANK_BIK}", s_small),
        Paragraph(f"Корр. сч.: {BANK_CORR}", s_small),
        Paragraph(f"Сч. №: {BANK_ACC}", s_small),
        Paragraph(f"ИНН: {SUPPLIER_INN}", s_small),
    ]
    sb_tbl = Table([[sup_cell, bnk_cell]], colWidths=[W * 0.5 - 3 * mm, W * 0.5 - 3 * mm])
    sb_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BG),
        ("BOX",           (0, 0), (0, 0),  0.5, colors.HexColor("#dbeafe")),
        ("BOX",           (1, 0), (1, 0),  0.5, colors.HexColor("#dbeafe")),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(sb_tbl)
    story.append(Spacer(1, 4 * mm))

    # ── ПОКУПАТЕЛЬ ────────────────────────────────────────────────────────
    buyer_inner = [
        Paragraph("ПОКУПАТЕЛЬ", s_lbl_gr),
        Paragraph(invoice.get("client_name", ""), s_bold),
        Paragraph(invoice.get("client_email", ""), s_small),
    ]
    buyer_tbl = Table([[buyer_inner]], colWidths=[W])
    buyer_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#fafafa")),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(buyer_tbl)
    story.append(Spacer(1, 4 * mm))

    # ── ТАБЛИЦА ПОЗИЦИЙ ───────────────────────────────────────────────────
    items = invoice.get("items", [])
    col_w = [10 * mm, W - 10*mm - 18*mm - 34*mm - 36*mm, 18*mm, 34*mm, 36*mm]

    rows = [[
        Paragraph("№", s_th),
        Paragraph("Наименование товара / услуги", s_th),
        Paragraph("Кол.", s_th),
        Paragraph("Цена", s_th),
        Paragraph("Сумма", s_th),
    ]]
    for i, item in enumerate(items):
        qty   = item.get("quantity", 1)
        price = float(item.get("price", 0))
        total = qty * price
        rows.append([
            Paragraph(str(i + 1), s_center),
            Paragraph(item.get("description", ""), st(f"td{i}", fontSize=9, textColor=DARK, fontName=F)),
            Paragraph(str(qty), s_center),
            Paragraph(_fmt_money(price), st(f"pr{i}", fontSize=9, textColor=GRAY, alignment=TA_RIGHT, fontName=F)),
            Paragraph(_fmt_money(total),  st(f"sm{i}", fontSize=9, fontName=FB, textColor=DARK, alignment=TA_RIGHT)),
        ])

    items_tbl = Table(rows, colWidths=col_w, repeatRows=1)
    row_styles = [
        ("BACKGROUND",    (0, 0), (-1, 0),  BLUE),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("ALIGN",         (1, 0), (1, -1),  "LEFT"),
        ("ALIGN",         (3, 0), (4, -1),  "RIGHT"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 5),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 5),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, colors.HexColor("#e5e7eb")),
    ]
    for r in range(1, len(rows)):
        if r % 2 == 0:
            row_styles.append(("BACKGROUND", (0, r), (-1, r), BG))
    items_tbl.setStyle(TableStyle(row_styles))
    story.append(items_tbl)
    story.append(Spacer(1, 4 * mm))

    # ── ИТОГО ─────────────────────────────────────────────────────────────
    total = float(invoice.get("total", 0))
    sub_rows = [
        [Paragraph("Подытог", s_small), Paragraph(_fmt_money(total), s_right)],
        [Paragraph("НДС",     s_small), Paragraph("Без НДС",         s_right)],
    ]
    sub_tbl = Table(sub_rows, colWidths=[W * 0.65, W * 0.35])
    sub_tbl.setStyle(TableStyle([
        ("LINEBELOW",     (0, 0), (-1, 0), 0.5, colors.HexColor("#e5e7eb")),
        ("LINEBELOW",     (0, 1), (-1, 1), 0.5, colors.HexColor("#e5e7eb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    itogo_tbl = Table([[
        Paragraph("ИТОГО К ОПЛАТЕ", s_white),
        Paragraph(_fmt_money(total), st("whr", fontName=FB, fontSize=11, textColor=WHITE, alignment=TA_RIGHT)),
    ]], colWidths=[W * 0.65, W * 0.35])
    itogo_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BLUE),
        ("TOPPADDING",    (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    story.append(Table([[sub_tbl], [itogo_tbl]], colWidths=[W], hAlign="RIGHT"))
    story.append(Spacer(1, 4 * mm))

    # ── ПРИМЕЧАНИЕ ────────────────────────────────────────────────────────
    if invoice.get("note"):
        note_tbl = Table([[
            Paragraph("Примечание", st("np", fontName=FB, fontSize=7, textColor=colors.HexColor("#d97706"))),
            Paragraph(invoice["note"], st("nt", fontSize=9, fontName=F, textColor=DARK)),
        ]], colWidths=[22 * mm, W - 22 * mm])
        note_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
            ("LINEAFTER",     (0, 0), (0, -1),  2, colors.HexColor("#f59e0b")),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(note_tbl)
        story.append(Spacer(1, 4 * mm))

    # ── ПОДПИСИ ───────────────────────────────────────────────────────────
    sign_img = stamp_img = None
    sign_data = _fetch_image(SIGN_URL)
    if sign_data:
        sign_img = Image(sign_data, width=70, height=30)
    stamp_data = _fetch_image(STAMP_URL)
    if stamp_data:
        stamp_img = Image(stamp_data, width=54, height=54)

    if sign_img and stamp_img:
        sig_inner = Table([[sign_img, stamp_img]], colWidths=[72, 56])
        sig_inner.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
            ("LEFTPADDING",   (0, 0), (-1, -1), 0),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
            ("TOPPADDING",    (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        left_sig = sig_inner
    elif sign_img:
        left_sig = sign_img
    else:
        left_sig = Spacer(1, 14 * mm)

    left_cell  = [Paragraph("Руководитель / ИП", s_xsmall), Spacer(1, 2 * mm), left_sig,
                  HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=1 * mm),
                  Paragraph("Ивченко М.В.", s_xsmall)]
    right_cell = [Paragraph("Главный бухгалтер", s_xsmall), Spacer(1, 14 * mm),
                  HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=1 * mm),
                  Paragraph("подпись", s_xsmall)]

    sig_tbl = Table([[left_cell, right_cell]], colWidths=[W * 0.5, W * 0.5])
    sig_tbl.setStyle(TableStyle([
        ("VALIGN",       (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",  (1, 0), (1, 0),  16),
    ]))
    story.append(sig_tbl)

    # ── ПОДВАЛ ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 4 * mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=2 * mm))
    footer_tbl = Table([[
        Paragraph(f"Создано в Sweep · {SUPPLIER_NAME}", s_xsmall),
        Paragraph(f"№ {invoice['number']}", st("fc", fontName=F, fontSize=7, textColor=LGRAY, alignment=TA_RIGHT)),
    ]], colWidths=[W * 0.7, W * 0.3])
    story.append(footer_tbl)

    doc.build(story)
    return buf.getvalue()