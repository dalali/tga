#!/usr/bin/env python3
"""Generate all placeholder assets for TGA (browser-based GTA 1 clone)."""
import struct
import zlib
import json
import os

# ---------------------------------------------------------------------------
# Minimal PNG writer
# ---------------------------------------------------------------------------

def make_chunk(name: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(name + data) & 0xFFFFFFFF
    return struct.pack('>I', len(data)) + name + data + struct.pack('>I', crc)


def create_png(width: int, height: int, pixels: list) -> bytes:
    """Create a minimal PNG from an RGB pixel array (list of [r,g,b] triples)."""
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    raw = bytearray()
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            raw += bytes(pixels[y * width + x])

    idat = make_chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    iend = make_chunk(b'IEND', b'')
    return signature + ihdr + idat + iend


def solid_pixels(width: int, height: int, colour: list) -> list:
    return [colour[:] for _ in range(width * height)]


def write_png(path: str, width: int, height: int, pixels: list):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(create_png(width, height, pixels))
    print(f'  wrote {path}  ({width}x{height})')


# ---------------------------------------------------------------------------
# 1. Tileset  (256x256, 16x16 tiles, 16 cols x 16 rows)
# ---------------------------------------------------------------------------

def gen_tileset(path: str):
    W, H, TILE = 256, 256, 16

    COLOURS = [
        (50,  50,  55),   # row 0 : asphalt
        (180, 175, 165),  # row 1 : sidewalk
        (90,  70,  60),   # row 2 : building roof
        (40,  80,  40),   # row 3 : grass
        (20,  40,  80),   # row 4 : water
        (50,  50,  55),   # row 5 : road + centre dash (H)
        (50,  50,  55),   # row 6 : road + centre dash (V)
        (200, 100, 50),   # row 7 : dirt
        (230, 210, 130),  # row 8 : sand
        (60,  100, 60),   # row 9 : dense foliage
        (120, 100, 80),   # row 10: light pavement
        (70,  70,  75),   # row 11: concrete
        (40,  40,  45),   # row 12: dark asphalt
        (160, 140, 120),  # row 13: gravel
        (80,  50,  40),   # row 14: mud
        (200, 180, 160),  # row 15: pale stone
    ]

    # Build a flat pixel array: image is 256x256 = 65536 pixels.
    # Outer loops: image rows (y 0..255) then image cols (x 0..255).
    # Tile row ty = y // TILE, tile col tx = x // TILE
    # Pixel-within-tile: py = y % TILE, px = x % TILE
    pixels = []
    for y in range(H):
        ty = y // TILE
        py = y % TILE
        for x in range(W):
            tx = x // TILE
            px = x % TILE

            base = list(COLOURS[ty])

            # Row 5: horizontal centre-line (H road)
            if ty == 5 and py in (7, 8):
                base = [220, 220, 180]

            # Row 6: vertical centre-line (V road)
            if ty == 6 and px in (7, 8):
                base = [220, 220, 180]

            # Subtle darker edge for debugging tile boundaries
            if py == 0 or px == 0:
                base = [max(0, c - 15) for c in base]

            pixels.append(base)

    write_png(path, W, H, pixels)


# ---------------------------------------------------------------------------
# 2. Player sprite  (16x16, blue)
# ---------------------------------------------------------------------------

def gen_player(path: str):
    W, H = 16, 16
    BLUE = [68, 136, 255]
    DARK = [30, 70, 160]
    SKIN = [255, 200, 150]

    pixels = []
    for y in range(H):
        for x in range(W):
            # Simple human silhouette top-down
            # head (centre 4x4)
            if 6 <= x <= 9 and 5 <= y <= 8:
                px = SKIN
            # body
            elif 5 <= x <= 10 and 9 <= y <= 13:
                px = BLUE
            # outline
            elif (4 <= x <= 11 and 5 <= y <= 13) and (
                    x in (4, 11) or y in (5, 13)):
                px = DARK
            else:
                px = [0, 0, 0]   # transparent-ish (black)
            pixels.append(px)

    write_png(path, W, H, pixels)


# ---------------------------------------------------------------------------
# 3. Peds sprite  (48x16 — 3 frames × 16px wide)
# ---------------------------------------------------------------------------

def gen_peds(path: str):
    W, H = 48, 16
    FRAMES = [
        [68, 204, 68],    # green ped
        [204, 68, 68],    # red ped
        [136, 136, 170],  # grey ped
    ]
    pixels = []
    for y in range(H):
        for fx in range(3):
            col = FRAMES[fx]
            for lx in range(16):
                x_glob = fx * 16 + lx
                # same silhouette logic as player
                if 6 <= lx <= 9 and 3 <= y <= 6:
                    px = [255, 200, 150]
                elif 5 <= lx <= 10 and 7 <= y <= 13:
                    px = col
                elif (4 <= lx <= 11 and 3 <= y <= 13) and (
                        lx in (4, 11) or y in (3, 13)):
                    px = [max(0, c - 60) for c in col]
                else:
                    px = [0, 0, 0]
                pixels.append(px)

    write_png(path, W, H, pixels)


# ---------------------------------------------------------------------------
# 4. Cops sprite  (16x16, bright red with badge detail)
# ---------------------------------------------------------------------------

def gen_cops(path: str):
    W, H = 16, 16
    RED  = [238, 34, 34]
    DARK = [120, 10, 10]
    GOLD = [255, 215, 0]
    SKIN = [255, 200, 150]

    pixels = []
    for y in range(H):
        for x in range(W):
            if 6 <= x <= 9 and 5 <= y <= 8:
                px = SKIN
            elif 7 <= x <= 8 and 10 <= y <= 11:
                px = GOLD      # badge
            elif 5 <= x <= 10 and 9 <= y <= 13:
                px = RED
            elif (4 <= x <= 11 and 5 <= y <= 13) and (
                    x in (4, 11) or y in (5, 13)):
                px = DARK
            else:
                px = [0, 0, 0]
            pixels.append(px)

    write_png(path, W, H, pixels)


# ---------------------------------------------------------------------------
# 5. Vehicles sprite  (64x16 — sedan 24px | sports 24px | truck 16px)
# ---------------------------------------------------------------------------

def gen_vehicles(path: str):
    W, H = 64, 16

    # sedan: cols 0-23, yellow
    # sports: cols 24-47, orange
    # truck: cols 48-63, dark green

    SEDAN  = [240, 200,  30]
    SPORTS = [220, 120,  20]
    TRUCK  = [ 60, 110,  50]
    WINDOW = [160, 210, 230]
    WHEEL  = [ 30,  30,  30]

    def car_pixel(x_local, y, body_colour, width):
        # wheels at corners
        if (x_local in (1, 2) or x_local in (width - 3, width - 2)) and y in (1, 2, 13, 14):
            return WHEEL
        # windscreen
        if 4 <= x_local <= width - 5 and 4 <= y <= 7:
            return WINDOW
        # body
        if 1 <= x_local <= width - 2 and 1 <= y <= 14:
            return body_colour
        return [0, 0, 0]

    pixels = []
    for y in range(H):
        for x in range(W):
            if x < 24:
                px = car_pixel(x, y, SEDAN, 24)
            elif x < 48:
                px = car_pixel(x - 24, y, SPORTS, 24)
            else:
                px = car_pixel(x - 48, y, TRUCK, 16)
            pixels.append(px)

    write_png(path, W, H, pixels)


# ---------------------------------------------------------------------------
# 6. City map  (Tiled JSON, 64x64)
# ---------------------------------------------------------------------------

def gen_city_map(path: str):
    MAP_W, MAP_H = 64, 64

    WATER    = 5   # tile row 4 → gid 4*16+1 = 65  ... but we use 1-based row index
    SIDEWALK = 2
    ROAD     = 1
    BUILDING = 3
    GRASS    = 4

    # Tile IDs (1-based, matching tileset row 0 = gid 1 … row 4 = gid 65)
    # We keep it simple: single-tile-per-type using gid = row*16 + 1
    T = {
        'road':     1,   # row 0, col 0
        'sidewalk': 18,  # row 1, col 1  (1*16+2)
        'building': 33,  # row 2, col 0  (2*16+1)
        'grass':    49,  # row 3, col 0  (3*16+1)
        'water':    65,  # row 4, col 0  (4*16+1)
    }

    data = []
    for ty in range(MAP_H):
        for tx in range(MAP_W):
            # Outer 2-tile border: water
            if tx < 2 or tx >= MAP_W - 2 or ty < 2 or ty >= MAP_H - 2:
                tile = T['water']
            # Next 3-tile ring: sidewalk
            elif tx < 5 or tx >= MAP_W - 5 or ty < 5 or ty >= MAP_H - 5:
                tile = T['sidewalk']
            else:
                # Interior: city block grid
                # Block grid starts at offset 5, period 8 tiles
                # Tiles 0-1 within period: road corridor
                # Tiles 2-5: building block (4 wide)
                # Tiles 6-7: road corridor
                local_x = (tx - 5) % 8
                local_y = (ty - 5) % 8
                is_road_x = local_x < 2 or local_x >= 6
                is_road_y = local_y < 2 or local_y >= 6
                if is_road_x or is_road_y:
                    tile = T['road']
                else:
                    tile = T['building']

            data.append(tile)

    tiled_map = {
        "compressionlevel": -1,
        "height": MAP_H,
        "width": MAP_W,
        "infinite": False,
        "layers": [
            {
                "data": data,
                "height": MAP_H,
                "id": 1,
                "name": "Ground",
                "opacity": 1,
                "type": "tilelayer",
                "visible": True,
                "width": MAP_W,
                "x": 0,
                "y": 0
            }
        ],
        "nextlayerid": 2,
        "nextobjectid": 1,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.10.2",
        "tileheight": 16,
        "tilesets": [
            {
                "columns": 16,
                "firstgid": 1,
                "image": "../sprites/tileset.png",
                "imageheight": 256,
                "imagewidth": 256,
                "margin": 0,
                "name": "tileset",
                "spacing": 0,
                "tilecount": 256,
                "tileheight": 16,
                "tilewidth": 16
            }
        ],
        "tilewidth": 16,
        "type": "map",
        "version": "1.10"
    }

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(tiled_map, f, indent=2)
    print(f'  wrote {path}  (64x64 city map, {len(data)} tiles)')


# ---------------------------------------------------------------------------
# 7. Audio stubs  (empty .ogg placeholders)
# ---------------------------------------------------------------------------

def gen_audio_stubs(audio_dir: str):
    files = [
        'engine.ogg',
        'gunshot.ogg',
        'siren.ogg',
        'scream.ogg',
        'explosion.ogg',
        'pickup.ogg',
        'ui-click.ogg',
        'city-ambience.ogg',
    ]
    os.makedirs(audio_dir, exist_ok=True)
    for name in files:
        path = os.path.join(audio_dir, name)
        # Write a minimal valid stub comment so we don't break OGG parsers
        # that expect magic bytes — just leave empty and note in LICENSES
        with open(path, 'wb') as f:
            f.write(b'')   # empty placeholder
        print(f'  stub  {path}')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    base = os.path.join(os.path.dirname(__file__), 'public', 'assets')
    sprites = os.path.join(base, 'sprites')
    maps    = os.path.join(base, 'maps')
    audio   = os.path.join(base, 'audio')

    print('Generating tileset...')
    gen_tileset(os.path.join(sprites, 'tileset.png'))

    print('Generating sprite placeholders...')
    gen_player(os.path.join(sprites, 'player.png'))
    gen_peds(os.path.join(sprites, 'peds.png'))
    gen_cops(os.path.join(sprites, 'cops.png'))
    gen_vehicles(os.path.join(sprites, 'vehicles.png'))

    print('Generating city map...')
    gen_city_map(os.path.join(maps, 'city.json'))

    print('Generating audio stubs...')
    gen_audio_stubs(audio)

    print('\nDone — all placeholder assets written to public/assets/')
