"""Encode responsive, transparent logo assets from the existing source artwork."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parent.parent / "assets"
with Image.open(assets / "logo-grupo-portel.png") as source:
    source = source.convert("RGBA")
    for width in (96, 192, 320):
        height = round(source.height * width / source.width)
        variant = source.resize((width, height), Image.Resampling.LANCZOS)
        target = assets / f"logo-grupo-portel-{width}.webp"
        variant.save(target, format="WEBP", lossless=True, method=6, exact=True)
        print(f"{target.name}: {width}x{height}, {target.stat().st_size} bytes")
