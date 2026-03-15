"""Генерация PDF счёта через ReportLab"""
import io
import os
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER

LOGO_URL = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/74927180-ad7e-4282-8b42-bb069cf38a4e.png"
STAMP_URL = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/e95b92dd-9ec9-4d53-8c1c-ab83b350edda.png"
SIGN_URL  = "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/1e6df93a-5956-48d3-8fda-77ead1406915.png"

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

def _fetch_image(url: str):
    try:
        r = requests.get(url, timeout=8)
        return io.BytesIO(r.content)
    except Exception:
        return None

def _fmt_money(amount) -> str:
    return f"{float(amount):,.2f} ₽".replace(",", " ")

def _fmt_date(d) -> str:
    if not d:
        return "—"
    if hasattr(d, "strftime"):
        return d.strftime("%d.%m.%Y")
    parts = str(d).split("-")
    if len(parts) == 3:
        return f"{parts[2]}.{parts[1]}.{parts[0]}"
    return str(d)

def generate_invoice_pdf(invoice: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=16*mm, bottomMargin=16*mm
    )

    W = A4[0] - 40*mm  # usable width

    # styles
    def st(name, **kw):
        base = dict(fontName="Helvetica", fontSize=9, leading=13, textColor=DARK)
        base.update(kw)
        return ParagraphStyle(name, **base)

    s_title  = st("title",  fontSize=20, fontName="Helvetica-Bold", textColor=DARK)
    s_num    = st("num",    fontSize=10, textColor=GRAY, fontName="Courier")
    s_label  = st("label",  fontSize=8,  textColor=LGRAY, fontName="Helvetica-Bold", spaceAfter=2)
    s_bold   = st("bold",   fontSize=9,  fontName="Helvetica-Bold")
    s_small  = st("small",  fontSize=8,  textColor=GRAY)
    s_xsmall = st("xsmall", fontSize=7,  textColor=LGRAY)
    s_right  = st("right",  alignment=TA_RIGHT)
    s_r_bold = st("rbold",  alignment=TA_RIGHT, fontName="Helvetica-Bold")
    s_white  = st("white",  textColor=WHITE, fontName="Helvetica-Bold", fontSize=10)
    s_th     = st("th",     textColor=WHITE, fontName="Helvetica-Bold", fontSize=8, alignment=TA_CENTER)
    s_center = st("center", alignment=TA_CENTER, fontSize=8, textColor=GRAY)
    s_red    = st("red",    textColor=RED, fontName="Helvetica-Bold", fontSize=8)

    story = []

    # ── HEADER ──
    logo_img = None
    logo_data = _fetch_image(LOGO_URL)
    if logo_data:
        logo_img = Image(logo_data, width=80, height=22)

    header_data = [
        [logo_img or Paragraph("Sweep", s_bold),
         Paragraph("СЧЁТ НА ОПЛАТУ", s_title)]
    ]
    header_tbl = Table(header_data, colWidths=[W*0.5, W*0.5])
    header_tbl.setStyle(TableStyle([
        ("ALIGN", (0,0), (0,0), "LEFT"),
        ("ALIGN", (1,0), (1,0), "RIGHT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(header_tbl)

    # number + dates
    meta_data = [
        [Paragraph(f"№ {invoice['number']}", s_num),
         Paragraph(f"Дата: <b>{_fmt_date(invoice.get('created_at'))}</b>", s_right)],
        [Paragraph("", s_small),
         Paragraph(f"Срок оплаты: <font color='#ef4444'><b>{_fmt_date(invoice.get('due_date'))}</b></font>", s_right)],
    ]
    meta_tbl = Table(meta_data, colWidths=[W*0.5, W*0.5])
    meta_tbl.setStyle(TableStyle([("TOPPADDING",(0,0),(-1,-1),2),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
    story.append(meta_tbl)
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=6*mm, spaceBefore=3*mm))

    # ── SUPPLIER + BANK ──
    sup = [
        Paragraph("ПОСТАВЩИК", ParagraphStyle("lbl2", fontName="Helvetica-Bold", fontSize=7, textColor=BLUE, spaceAfter=3)),
        Paragraph(SUPPLIER_NAME, s_bold),
        Paragraph(f"ИНН {SUPPLIER_INN}", s_small),
        Paragraph(SUPPLIER_ADDRESS, s_xsmall),
    ]
    bnk = [
        Paragraph("БАНК ПОЛУЧАТЕЛЯ", ParagraphStyle("lbl3", fontName="Helvetica-Bold", fontSize=7, textColor=BLUE, spaceAfter=3)),
        Paragraph(BANK_NAME, s_bold),
        Paragraph(f"БИК: {BANK_BIK}", s_small),
        Paragraph(f"Корр. сч.: {BANK_CORR}", s_small),
        Paragraph(f"Сч. №: {BANK_ACC}", s_small),
        Paragraph(f"ИНН: {SUPPLIER_INN}", s_small),
    ]
    sb_data = [[sup, bnk]]
    sb_tbl = Table(sb_data, colWidths=[W*0.5 - 3*mm, W*0.5 - 3*mm], hAlign="LEFT")
    sb_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BG),
        ("BOX",        (0,0), (0,0),   0.5, colors.HexColor("#dbeafe")),
        ("BOX",        (1,0), (1,0),   0.5, colors.HexColor("#dbeafe")),
        ("ROUNDEDCORNERS", [4]),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0),(-1,-1), 8),
        ("RIGHTPADDING",(0,0),(-1,-1), 8),
        ("TOPPADDING",  (0,0),(-1,-1), 8),
        ("BOTTOMPADDING",(0,0),(-1,-1), 8),
        ("COLPADDING",  (0,0),(-1,-1), 6),
    ]))
    story.append(sb_tbl)
    story.append(Spacer(1, 4*mm))

    # ── BUYER ──
    buyer_data = [[
        Paragraph("ПОКУПАТЕЛЬ", ParagraphStyle("lbl4", fontName="Helvetica-Bold", fontSize=7, textColor=LGRAY, spaceAfter=3)),
        Paragraph(invoice.get("client_name", ""), s_bold),
        Paragraph(invoice.get("client_email", ""), s_small),
    ]]
    buyer_tbl = Table([[buyer_data[0]]], colWidths=[W])
    buyer_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,-1), colors.HexColor("#fafafa")),
        ("BOX",        (0,0),(-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ("LEFTPADDING",(0,0),(-1,-1), 10),
        ("TOPPADDING", (0,0),(-1,-1), 8),
        ("BOTTOMPADDING",(0,0),(-1,-1), 8),
    ]))
    story.append(buyer_tbl)
    story.append(Spacer(1, 4*mm))

    # ── ITEMS TABLE ──
    items = invoice.get("items", [])
    th = [
        Paragraph("№", s_th),
        Paragraph("Наименование", s_th),
        Paragraph("Кол.", s_th),
        Paragraph("Цена", s_th),
        Paragraph("Сумма", s_th),
    ]
    rows = [th]
    for i, item in enumerate(items):
        qty   = item.get("quantity", 1)
        price = float(item.get("price", 0))
        total = qty * price
        row = [
            Paragraph(str(i+1), s_center),
            Paragraph(item.get("description",""), st("td", fontSize=9, textColor=DARK)),
            Paragraph(str(qty), s_center),
            Paragraph(_fmt_money(price), st("tdr", fontSize=9, textColor=GRAY, alignment=TA_RIGHT)),
            Paragraph(_fmt_money(total),  st("tdt", fontSize=9, fontName="Helvetica-Bold", textColor=DARK, alignment=TA_RIGHT)),
        ]
        rows.append(row)

    col_w = [10*mm, W - 10*mm - 18*mm - 35*mm - 38*mm, 18*mm, 35*mm, 38*mm]
    items_tbl = Table(rows, colWidths=col_w, repeatRows=1)
    row_styles = [
        ("BACKGROUND",    (0,0), (-1,0),  BLUE),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0),  8),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("ALIGN",         (1,0), (1,-1),  "LEFT"),
        ("ALIGN",         (3,0), (4,-1),  "RIGHT"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("LINEBELOW",     (0,0), (-1,-1), 0.3, colors.HexColor("#e5e7eb")),
    ]
    for r in range(1, len(rows)):
        if r % 2 == 0:
            row_styles.append(("BACKGROUND", (0,r), (-1,r), BG))
    items_tbl.setStyle(TableStyle(row_styles))
    story.append(items_tbl)
    story.append(Spacer(1, 4*mm))

    # ── TOTAL ──
    total = float(invoice.get("total", 0))
    total_data = [
        [Paragraph("Подытог", s_small), Paragraph(_fmt_money(total), s_right)],
        [Paragraph("НДС", s_small),     Paragraph("Без НДС", s_right)],
    ]
    total_tbl = Table(total_data, colWidths=[W*0.65, W*0.35])
    total_tbl.setStyle(TableStyle([
        ("LINEBELOW", (0,0), (-1,0), 0.5, colors.HexColor("#e5e7eb")),
        ("LINEBELOW", (0,1), (-1,1), 0.5, colors.HexColor("#e5e7eb")),
        ("TOPPADDING",    (0,0),(-1,-1), 4),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
    ]))

    itogo_data = [[
        Paragraph("ИТОГО К ОПЛАТЕ", s_white),
        Paragraph(_fmt_money(total), ParagraphStyle("whr", fontName="Helvetica-Bold", fontSize=11, textColor=WHITE, alignment=TA_RIGHT)),
    ]]
    itogo_tbl = Table(itogo_data, colWidths=[W*0.65, W*0.35])
    itogo_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), BLUE),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS", [4]),
    ]))

    outer = Table([[total_tbl], [itogo_tbl]], colWidths=[W], hAlign="RIGHT")
    story.append(outer)
    story.append(Spacer(1, 5*mm))

    # ── NOTE ──
    if invoice.get("note"):
        note_data = [[
            Paragraph("Примечание", ParagraphStyle("np", fontName="Helvetica-Bold", fontSize=7, textColor=colors.HexColor("#d97706"), spaceAfter=2)),
            Paragraph(invoice["note"], st("nt", fontSize=9, textColor=DARK)),
        ]]
        note_tbl = Table(note_data, colWidths=[22*mm, W - 22*mm])
        note_tbl.setStyle(TableStyle([
            ("BACKGROUND",     (0,0),(-1,-1), colors.HexColor("#fffbeb")),
            ("LINEAFTER",      (0,0),(0,-1),  2, colors.HexColor("#f59e0b")),
            ("LEFTPADDING",    (0,0),(-1,-1), 8),
            ("RIGHTPADDING",   (0,0),(-1,-1), 8),
            ("TOPPADDING",     (0,0),(-1,-1), 6),
            ("BOTTOMPADDING",  (0,0),(-1,-1), 6),
        ]))
        story.append(note_tbl)
        story.append(Spacer(1, 4*mm))

    # ── SIGNATURES ──
    sign_img = stamp_img = None
    sign_data = _fetch_image(SIGN_URL)
    if sign_data:
        sign_img = Image(sign_data, width=70, height=32)
    stamp_data = _fetch_image(STAMP_URL)
    if stamp_data:
        stamp_img = Image(stamp_data, width=52, height=52)

    left_cell = []
    left_cell.append(Paragraph("Руководитель / ИП", s_xsmall))
    left_cell.append(Spacer(1, 2*mm))
    if sign_img and stamp_img:
        sig_row = Table([[sign_img, stamp_img]], colWidths=[75, 55])
        sig_row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"BOTTOM"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0)]))
        left_cell.append(sig_row)
    elif sign_img:
        left_cell.append(sign_img)
    left_cell.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=1*mm))
    left_cell.append(Paragraph("Ивченко М.В.", s_xsmall))

    right_cell = [
        Paragraph("Главный бухгалтер", s_xsmall),
        Spacer(1, 14*mm),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=1*mm),
        Paragraph("подпись", s_xsmall),
    ]

    sig_tbl = Table([[left_cell, right_cell]], colWidths=[W*0.5, W*0.5])
    sig_tbl.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(1,0),(1,0),16)]))
    story.append(sig_tbl)

    # ── FOOTER ──
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=2*mm))
    footer_data = [[
        Paragraph(f"Создано в Sweep · {SUPPLIER_NAME}", s_xsmall),
        Paragraph(f"№ {invoice['number']}", ParagraphStyle("fc", fontName="Courier", fontSize=7, textColor=LGRAY, alignment=TA_RIGHT)),
    ]]
    footer_tbl = Table(footer_data, colWidths=[W*0.7, W*0.3])
    story.append(footer_tbl)

    doc.build(story)
    return buf.getvalue()
