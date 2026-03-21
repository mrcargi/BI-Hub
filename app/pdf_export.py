"""
pdf_export.py — Genera un PDF de resumen ejecutivo para un reporte PBI Docs
"""
import io
import os
from pathlib import Path
from datetime import datetime

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether,
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas as pdfcanvas

from pypdf import PdfReader, PdfWriter


# ── Colors ──────────────────────────────────────────────────────
C_PRIMARY   = HexColor('#16a34a')
C_PRIMARY_LT= HexColor('#dcfce7')
C_DARK      = HexColor('#18181b')
C_GRAY      = HexColor('#71717a')
C_GRAY_LT   = HexColor('#f4f4f5')
C_BORDER    = HexColor('#e5e7eb')
C_WHITE     = white
C_BLUE      = HexColor('#2563eb')
C_BLUE_LT   = HexColor('#dbeafe')
C_PURPLE    = HexColor('#7c3aed')
C_PURPLE_LT = HexColor('#ede9fe')
C_ORANGE    = HexColor('#d97706')
C_ORANGE_LT = HexColor('#fef3c7')
C_RED       = HexColor('#dc2626')

TYPE_COLORS = {
    'import': (C_PRIMARY, C_PRIMARY_LT),
    'calc':   (C_BLUE, C_BLUE_LT),
    'empty':  (C_PURPLE, C_PURPLE_LT),
    'param':  (C_ORANGE, C_ORANGE_LT),
}

TYPE_LABELS = {
    'import': 'Import', 'calc': 'Calculada', 'empty': 'Vacía', 'param': 'Parámetro',
}


# ── Styles ──────────────────────────────────────────────────────
def build_styles():
    s = getSampleStyleSheet()

    s.add(ParagraphStyle('DocTitle', fontName='Helvetica-Bold', fontSize=22,
                         textColor=C_DARK, spaceAfter=4, leading=26))
    s.add(ParagraphStyle('DocSubtitle', fontName='Helvetica', fontSize=10,
                         textColor=C_GRAY, spaceAfter=12, leading=14))
    s.add(ParagraphStyle('SectionTitle', fontName='Helvetica-Bold', fontSize=14,
                         textColor=C_PRIMARY, spaceBefore=18, spaceAfter=8, leading=18,
                         borderPadding=(0,0,4,0)))
    s.add(ParagraphStyle('SubSection', fontName='Helvetica-Bold', fontSize=11,
                         textColor=C_DARK, spaceBefore=12, spaceAfter=6, leading=14))
    s.add(ParagraphStyle('Body', fontName='Helvetica', fontSize=9.5,
                         textColor=C_DARK, spaceAfter=6, leading=13))
    s.add(ParagraphStyle('BodySmall', fontName='Helvetica', fontSize=8.5,
                         textColor=C_GRAY, spaceAfter=4, leading=11))
    s.add(ParagraphStyle('Mono', fontName='Courier', fontSize=8.5,
                         textColor=C_DARK, spaceAfter=4, leading=11))
    s.add(ParagraphStyle('CellText', fontName='Helvetica', fontSize=8.5,
                         textColor=C_DARK, leading=11))
    s.add(ParagraphStyle('CellBold', fontName='Helvetica-Bold', fontSize=8.5,
                         textColor=C_DARK, leading=11))
    s.add(ParagraphStyle('CellGray', fontName='Helvetica', fontSize=8,
                         textColor=C_GRAY, leading=10))
    s.add(ParagraphStyle('FolderTitle', fontName='Helvetica-Bold', fontSize=10,
                         textColor=C_DARK, leading=13))
    s.add(ParagraphStyle('MetricVal', fontName='Helvetica-Bold', fontSize=20,
                         textColor=C_PRIMARY, alignment=TA_CENTER, leading=24))
    s.add(ParagraphStyle('MetricLbl', fontName='Helvetica', fontSize=8,
                         textColor=C_GRAY, alignment=TA_CENTER, leading=10))
    s.add(ParagraphStyle('Footer', fontName='Helvetica', fontSize=7,
                         textColor=C_GRAY, alignment=TA_CENTER))
    return s


# ── Custom Flowables ────────────────────────────────────────────
class ColorBadge(Flowable):
    """Inline colored badge for table type."""
    def __init__(self, text, bg_color, text_color=white, width=55, height=14):
        Flowable.__init__(self)
        self.text = text
        self.bg = bg_color
        self.tc = text_color
        self.width = width
        self.height = height

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)

    def draw(self):
        self.canv.setFillColor(self.bg)
        self.canv.roundRect(0, 0, self.width, self.height, 3, fill=1, stroke=0)
        self.canv.setFillColor(self.tc)
        self.canv.setFont('Helvetica-Bold', 7)
        self.canv.drawCentredString(self.width/2, 4, self.text)


class SectionDivider(Flowable):
    """Horizontal green line divider."""
    def __init__(self, width=500):
        Flowable.__init__(self)
        self.width = width
        self.height = 8

    def wrap(self, availWidth, availHeight):
        return (availWidth, self.height)

    def draw(self):
        self.canv.setStrokeColor(C_PRIMARY)
        self.canv.setLineWidth(1.5)
        self.canv.line(0, self.height/2, self.width, self.height/2)


# ── Page Template ───────────────────────────────────────────────
def _header_footer(canvas, doc, doc_name=''):
    canvas.saveState()
    w, h = LETTER

    # Header line
    canvas.setStrokeColor(C_PRIMARY)
    canvas.setLineWidth(0.8)
    canvas.line(40, h - 45, w - 40, h - 45)

    # Header text
    canvas.setFont('Helvetica-Bold', 8)
    canvas.setFillColor(C_PRIMARY)
    canvas.drawString(40, h - 40, 'PBI Docs · NADRO')

    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(C_GRAY)
    canvas.drawRightString(w - 40, h - 40, f'Resumen Ejecutivo — {doc_name}')

    # Footer
    canvas.setStrokeColor(C_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(40, 35, w - 40, 35)

    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(C_GRAY)
    canvas.drawString(40, 22, f'Generado: {datetime.now().strftime("%d/%m/%Y %H:%M")}')
    canvas.drawRightString(w - 40, 22, f'Página {doc.page}')

    canvas.restoreState()


# ── Main PDF Builder ────────────────────────────────────────────
def generate_report_pdf(doc: dict) -> bytes:
    """Build a complete executive summary PDF for a reporte. Returns PDF bytes."""
    buf = io.BytesIO()
    styles = build_styles()

    page_w, page_h = LETTER
    margin = 40

    template = SimpleDocTemplate(
        buf, pagesize=LETTER,
        leftMargin=margin, rightMargin=margin,
        topMargin=55, bottomMargin=50,
        title=doc.get('name', 'Reporte'),
        author='PBI Docs · NADRO',
    )

    story = []
    usable_w = page_w - margin * 2

    doc_name = doc.get('name', 'Sin nombre')

    # ═══════════════════════════════════════════════════════════
    #  COVER / HEADER
    # ═══════════════════════════════════════════════════════════
    story.append(Spacer(1, 10))
    emoji = doc.get('emoji', '📄')
    story.append(Paragraph(f'{emoji} {doc_name}', styles['DocTitle']))

    meta_parts = []
    if doc.get('area'): meta_parts.append(f"Área: {doc['area']}")
    if doc.get('direccion'): meta_parts.append(f"Dirección: {doc['direccion']}")
    if doc.get('createdAt'): meta_parts.append(f"Fecha: {doc['createdAt']}")
    if doc.get('compat'): meta_parts.append(f"PBI {doc['compat']}")
    if doc.get('estado'): meta_parts.append(f"Estado: {doc['estado'].upper()}")
    story.append(Paragraph(' · '.join(meta_parts), styles['DocSubtitle']))

    if doc.get('tags'):
        tags_str = '  '.join([f'#{t}' for t in doc['tags']])
        story.append(Paragraph(tags_str, styles['BodySmall']))

    if doc.get('desc'):
        story.append(Spacer(1, 6))
        story.append(Paragraph(doc['desc'], styles['Body']))

    story.append(Spacer(1, 8))
    story.append(SectionDivider(usable_w))

    # ═══════════════════════════════════════════════════════════
    #  1. RESUMEN — Métricas
    # ═══════════════════════════════════════════════════════════
    story.append(Paragraph('1. Resumen del Modelo', styles['SectionTitle']))

    tables_list = doc.get('tables', [])
    columns_list = doc.get('columns', [])
    folders_list = doc.get('folders', [])
    relations_list = doc.get('relations', [])
    total_measures = sum(len(f.get('measures', [])) for f in folders_list)
    active_rels = len([r for r in relations_list if r.get('active')])

    # Metrics row
    metric_data = [
        [Paragraph(str(len(tables_list)), styles['MetricVal']),
         Paragraph(str(len(columns_list)), styles['MetricVal']),
         Paragraph(str(total_measures), styles['MetricVal']),
         Paragraph(str(active_rels), styles['MetricVal'])],
        [Paragraph('Tablas', styles['MetricLbl']),
         Paragraph('Columnas', styles['MetricLbl']),
         Paragraph('Medidas DAX', styles['MetricLbl']),
         Paragraph('Relaciones', styles['MetricLbl'])],
    ]
    metric_tbl = Table(metric_data, colWidths=[usable_w/4]*4, rowHeights=[32, 16])
    metric_tbl.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (0,1), 0.5, C_PRIMARY),
        ('BOX', (1,0), (1,1), 0.5, C_PRIMARY),
        ('BOX', (2,0), (2,1), 0.5, C_PRIMARY),
        ('BOX', (3,0), (3,1), 0.5, C_PRIMARY),
        ('BACKGROUND', (0,0), (-1,-1), C_PRIMARY_LT),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING', (0,1), (-1,1), 6),
        ('ROUNDEDCORNERS', [4,4,4,4]),
    ]))
    story.append(metric_tbl)
    story.append(Spacer(1, 10))

    # ═══════════════════════════════════════════════════════════
    #  2. TABLAS DEL MODELO
    # ═══════════════════════════════════════════════════════════
    story.append(Paragraph('2. Tablas del Modelo', styles['SectionTitle']))

    if tables_list:
        t_header = [
            Paragraph('<b>Tabla</b>', styles['CellBold']),
            Paragraph('<b>Tipo</b>', styles['CellBold']),
            Paragraph('<b>Cols</b>', styles['CellBold']),
            Paragraph('<b>Filas</b>', styles['CellBold']),
            Paragraph('<b>Descripción</b>', styles['CellBold']),
        ]
        t_rows = [t_header]
        for t in tables_list:
            type_label = TYPE_LABELS.get(t.get('type',''), t.get('type',''))
            t_rows.append([
                Paragraph(f"<b>{t.get('name','')}</b>", styles['CellBold']),
                Paragraph(type_label, styles['CellText']),
                Paragraph(str(t.get('cols','')), styles['Mono']),
                Paragraph(str(t.get('rows','')), styles['CellGray']),
                Paragraph(t.get('desc',''), styles['CellText']),
            ])

        col_widths = [usable_w*0.18, usable_w*0.10, usable_w*0.06, usable_w*0.08, usable_w*0.58]
        tbl = Table(t_rows, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), C_DARK),
            ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('TOPPADDING', (0,0), (-1,0), 6),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_GRAY_LT]),
            ('GRID', (0,0), (-1,-1), 0.4, C_BORDER),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,1), (-1,-1), 4),
            ('BOTTOMPADDING', (0,1), (-1,-1), 4),
        ]))
        story.append(tbl)

    # ═══════════════════════════════════════════════════════════
    #  3. RELACIONES
    # ═══════════════════════════════════════════════════════════
    visible_rels = [r for r in relations_list if 'Local' not in r.get('toTable','')]
    if visible_rels:
        story.append(Paragraph('3. Relaciones', styles['SectionTitle']))

        r_header = [
            Paragraph('<b>Origen</b>', styles['CellBold']),
            Paragraph('<b>Columna</b>', styles['CellBold']),
            Paragraph('<b>→</b>', styles['CellBold']),
            Paragraph('<b>Destino</b>', styles['CellBold']),
            Paragraph('<b>Columna</b>', styles['CellBold']),
            Paragraph('<b>Card.</b>', styles['CellBold']),
            Paragraph('<b>Dir.</b>', styles['CellBold']),
            Paragraph('<b>Estado</b>', styles['CellBold']),
        ]
        r_rows = [r_header]
        for r in visible_rels:
            dir_label = '↔ Ambas' if r.get('dir') == 'BothDirections' else '→ Una'
            estado = 'Activa' if r.get('active') else 'Inactiva'
            r_rows.append([
                Paragraph(r.get('fromTable',''), styles['CellBold']),
                Paragraph(r.get('fromCol',''), styles['Mono']),
                Paragraph('→', styles['CellText']),
                Paragraph(r.get('toTable',''), styles['CellBold']),
                Paragraph(r.get('toCol',''), styles['Mono']),
                Paragraph(r.get('card',''), styles['Mono']),
                Paragraph(dir_label, styles['CellGray']),
                Paragraph(estado, styles['CellText']),
            ])

        rw = usable_w
        r_widths = [rw*0.16, rw*0.12, rw*0.03, rw*0.16, rw*0.12, rw*0.07, rw*0.10, rw*0.08]
        rtbl = Table(r_rows, colWidths=r_widths, repeatRows=1)
        rtbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), C_DARK),
            ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_GRAY_LT]),
            ('GRID', (0,0), (-1,-1), 0.4, C_BORDER),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(rtbl)

    # ═══════════════════════════════════════════════════════════
    #  4. COLUMNAS
    # ═══════════════════════════════════════════════════════════
    if columns_list:
        story.append(Paragraph('4. Columnas', styles['SectionTitle']))

        c_header = [
            Paragraph('<b>#</b>', styles['CellBold']),
            Paragraph('<b>Columna</b>', styles['CellBold']),
            Paragraph('<b>Tipo</b>', styles['CellBold']),
            Paragraph('<b>Descripción</b>', styles['CellBold']),
        ]
        c_rows = [c_header]
        for i, c in enumerate(columns_list, 1):
            c_rows.append([
                Paragraph(str(i), styles['CellGray']),
                Paragraph(f"<b>{c.get('n','')}</b>", styles['CellBold']),
                Paragraph(c.get('t',''), styles['CellText']),
                Paragraph(c.get('d',''), styles['CellText']),
            ])

        c_widths = [usable_w*0.05, usable_w*0.22, usable_w*0.10, usable_w*0.63]
        ctbl = Table(c_rows, colWidths=c_widths, repeatRows=1)
        ctbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), C_DARK),
            ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_GRAY_LT]),
            ('GRID', (0,0), (-1,-1), 0.4, C_BORDER),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,1), (-1,-1), 3),
            ('BOTTOMPADDING', (0,1), (-1,-1), 3),
        ]))
        story.append(ctbl)

    # ═══════════════════════════════════════════════════════════
    #  5. MEDIDAS DAX
    # ═══════════════════════════════════════════════════════════
    if folders_list:
        story.append(Paragraph(f'5. Medidas DAX ({total_measures} medidas en {len(folders_list)} carpetas)',
                               styles['SectionTitle']))

        for folder in folders_list:
            measures = folder.get('measures', [])
            if not measures:
                continue

            fname = folder.get('name', 'Carpeta')
            fcolor = folder.get('color', '#71717a')

            story.append(Paragraph(f'📁 {fname} ({len(measures)} medidas)', styles['SubSection']))

            m_header = [
                Paragraph('<b>Medida</b>', styles['CellBold']),
                Paragraph('<b>Descripción</b>', styles['CellBold']),
            ]
            m_rows = [m_header]
            for m in measures:
                m_rows.append([
                    Paragraph(f"<b>{m.get('n','')}</b>", styles['CellBold']),
                    Paragraph(m.get('d',''), styles['CellText']),
                ])

            m_widths = [usable_w*0.30, usable_w*0.70]
            mtbl = Table(m_rows, colWidths=m_widths, repeatRows=1)

            try:
                hdr_color = HexColor(fcolor)
            except:
                hdr_color = C_DARK

            mtbl.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), hdr_color),
                ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,0), 8),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_GRAY_LT]),
                ('GRID', (0,0), (-1,-1), 0.4, C_BORDER),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 5),
                ('RIGHTPADDING', (0,0), (-1,-1), 5),
                ('TOPPADDING', (0,1), (-1,-1), 3),
                ('BOTTOMPADDING', (0,1), (-1,-1), 3),
            ]))
            story.append(mtbl)
            story.append(Spacer(1, 6))

    # ═══════════════════════════════════════════════════════════
    #  6. FUENTE DE DATOS
    # ═══════════════════════════════════════════════════════════
    source = doc.get('source')
    if source:
        story.append(Paragraph('6. Fuente de Datos', styles['SectionTitle']))

        src_items = [
            ('Conector', source.get('connector', '—')),
            ('URL base', source.get('url', '—')),
            ('Carpeta', source.get('folder', '—')),
            ('Archivos', source.get('fileType', '—')),
            ('Modo', source.get('mode', '—')),
            ('API', source.get('api', '—')),
            ('Servicio', source.get('user', '—')),
        ]
        src_rows = []
        for label, val in src_items:
            src_rows.append([
                Paragraph(f'<b>{label}</b>', styles['CellBold']),
                Paragraph(str(val), styles['CellText']),
            ])

        src_tbl = Table(src_rows, colWidths=[usable_w*0.15, usable_w*0.85])
        src_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), C_GRAY_LT),
            ('GRID', (0,0), (-1,-1), 0.4, C_BORDER),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(src_tbl)

        steps = source.get('steps', [])
        if steps:
            story.append(Spacer(1, 8))
            story.append(Paragraph('<b>Proceso de transformación:</b>', styles['Body']))
            for i, step in enumerate(steps, 1):
                story.append(Paragraph(f'{i}. {step}', styles['BodySmall']))

    # ═══════════════════════════════════════════════════════════
    #  BUILD
    # ═══════════════════════════════════════════════════════════
    def page_handler(canvas, doc_template):
        _header_footer(canvas, doc_template, doc_name=doc_name)

    template.build(story, onFirstPage=page_handler, onLaterPages=page_handler)
    report_bytes = buf.getvalue()
    buf.close()

    return report_bytes


def generate_report_pdf_with_attachment(doc: dict, pdfs_dir: Path) -> bytes:
    """
    Generate the executive summary PDF, and if the report has an attached PDF,
    append it at the end.
    """
    report_bytes = generate_report_pdf(doc)

    pdf_file = doc.get('pdfFile')
    if not pdf_file:
        return report_bytes

    attached_path = pdfs_dir / pdf_file
    if not attached_path.exists():
        return report_bytes

    # Merge: report + attached PDF
    writer = PdfWriter()

    # Add report pages
    report_reader = PdfReader(io.BytesIO(report_bytes))
    for page in report_reader.pages:
        writer.add_page(page)

    # Add separator page
    sep_buf = io.BytesIO()
    sep_c = pdfcanvas.Canvas(sep_buf, pagesize=LETTER)
    w, h = LETTER
    sep_c.setFillColor(C_DARK)
    sep_c.rect(0, 0, w, h, fill=1)
    sep_c.setFillColor(C_PRIMARY)
    sep_c.setFont('Helvetica-Bold', 28)
    sep_c.drawCentredString(w/2, h/2 + 20, 'Vista del Reporte')
    sep_c.setFillColor(HexColor('#a1a1aa'))
    sep_c.setFont('Helvetica', 12)
    sep_c.drawCentredString(w/2, h/2 - 15, f'PDF adjunto: {pdf_file}')
    sep_c.setFont('Helvetica', 9)
    sep_c.drawCentredString(w/2, h/2 - 40, 'Las siguientes páginas contienen el reporte exportado desde Power BI')
    sep_c.save()
    sep_buf.seek(0)
    sep_reader = PdfReader(sep_buf)
    writer.add_page(sep_reader.pages[0])

    # Add attached PDF
    try:
        attached_reader = PdfReader(str(attached_path))
        for page in attached_reader.pages:
            writer.add_page(page)
    except Exception:
        pass  # If can't read attachment, just skip

    out_buf = io.BytesIO()
    writer.write(out_buf)
    merged_bytes = out_buf.getvalue()
    out_buf.close()

    return merged_bytes
