"""Produce a self-contained, high-contrast QR code for the WRHA Hub home page.
The public site serves this SVG locally; no third-party QR network request is needed.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import qrcode
from qrcode.image.svg import SvgPathImage
URL = "https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/#home"
out = Path("assets/wrha-hub-share-qr.svg")
out.parent.mkdir(parents=True,exist_ok=True)
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=8,border=4)
q.add_data(URL);q.make(fit=True)
image=q.make_image(image_factory=SvgPathImage)
image.save(str(out))
text=out.read_text(encoding="utf-8")
root=ET.fromstring(text)
assert root.tag.endswith("svg") and len(text)>500
assert "path" in text
print(f"Created {out}, {len(text)} bytes, {q.modules_count} modules; QR encodes {URL}")
