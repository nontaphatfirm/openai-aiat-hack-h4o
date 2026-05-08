from pathlib import Path

from PIL import Image, ImageDraw


preview_dir = Path("scratch/previews")
files = sorted(preview_dir.glob("slide-*.png"))
tile_w, tile_h = 480, 270
cols = 2
rows = (len(files) + cols - 1) // cols
canvas = Image.new("RGB", (tile_w * cols, tile_h * rows), (248, 241, 225))
draw = ImageDraw.Draw(canvas)

for idx, file_path in enumerate(files):
    im = Image.open(file_path).convert("RGB")
    im.thumbnail((tile_w, tile_h))
    tile = Image.new("RGB", (tile_w, tile_h), (248, 241, 225))
    tile.paste(im, ((tile_w - im.width) // 2, (tile_h - im.height) // 2))
    x = (idx % cols) * tile_w
    y = (idx // cols) * tile_h
    canvas.paste(tile, (x, y))
    draw.text((x + 12, y + 10), str(idx + 1), fill=(18, 33, 29))

canvas.save(preview_dir / "contact-sheet.png")
