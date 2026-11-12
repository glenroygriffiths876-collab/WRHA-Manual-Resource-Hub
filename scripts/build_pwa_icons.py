"""Build an installable WRHA PWA icon set from the AUTHENTIC existing WRHA logo.

Preserves the original image; adds a blue/white protective field so Android
maskable crops and iOS home-screen icon crops never cut the WRHA artwork.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import json
SOURCE=Path("wrha-logo.webp")
OUT=Path("assets/app-icons")
OUT.mkdir(parents=True,exist_ok=True)
if not SOURCE.is_file():raise RuntimeError("Authentic WRHA logo is missing; refusing to invent one.")
logo=Image.open(SOURCE).convert("RGBA")
if logo.width<60 or logo.height<35:raise RuntimeError("Existing logo source is too small for reliable PWA icons")
# Remove only outer WHITE/NEAR-WHITE matte; preserve intentional colours & the logo lettering.
# Because the logo is photographic/low-res, never AI-redraw or alter it.
def create(size,maskable=False):
    bg=Image.new("RGBA",(size,size),("#0b478d" if maskable else "#f8fcff"))
    draw=ImageDraw.Draw(bg)
    p=int(size*(.13 if maskable else .055))
    box=[p,p,size-p-1,size-p-1]
    draw.rounded_rectangle(box,radius=int(size*.16),fill="#ffffff")
    if not maskable:
        draw.rounded_rectangle([max(0,p-2),max(0,p-2),size-p+1,size-p+1],
                               radius=int(size*.16),outline="#d4e7f7",width=max(1,int(size*.006)))
    # Maskable icon safe zone: official artwork stays in the centre of the circle.
    maxw=int(size*(.66 if maskable else .83))
    maxh=int(size*(.53 if maskable else .67))
    art=logo.copy();art.thumbnail((maxw,maxh),Image.Resampling.LANCZOS)
    x=(size-art.width)//2;y=(size-art.height)//2
    bg.alpha_composite(art,(x,y))
    return bg.convert("RGB")
for size in (32,48,180,192,512):
    name=f"wrha-icon-{size}.png"
    create(size).save(OUT/name,optimize=True)
for size in (192,512):
    create(size,maskable=True).save(OUT/f"wrha-maskable-{size}.png",optimize=True)
# iPhone/iPad Apple Touch Icon must be PNG, square, own file.
create(180).save(OUT/"apple-touch-icon.png",optimize=True)
paths=sorted(str(p) for p in OUT.glob("*.png"))
for path in paths:
    image=Image.open(path)
    expected=int(Path(path).stem.split("-")[-1]) if Path(path).stem!="apple-touch-icon" else 180
    assert image.size==(expected,expected),path
print("Built",len(paths),"authentic-logo app icons from",SOURCE,"source size",logo.size)
print(json.dumps(paths,indent=2))
