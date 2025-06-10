import svgwrite
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
import os

# Create SVG with skewed and stretched text
def create_svg(filename, text, font_family, font_size, fill, transform):
    dwg = svgwrite.Drawing(filename, size=(400, 120))
    dwg.add(dwg.text(
        text,
        insert=(20, 80),
        font_size=font_size,
        font_family=font_family,
        fill=fill,
        transform=transform
    ))
    dwg.save()

def svg_to_pdf(svg_filename, pdf_filename):
    # Convert SVG to ReportLab Graphics
    drawing = svg2rlg(svg_filename)
    # Render the drawing as PDF
    renderPDF.drawToFile(drawing, pdf_filename)
    # Clean up the temporary SVG file
    try:
        os.remove(svg_filename)
    except:
        pass
