#!/usr/bin/env python3
"""
Downscale-and-encode one Instagram picture. Called by
`scripts/ingest-instagram-folder.mjs` (never by hand, though it takes the same
JSON on stdin if you want to).

    python scripts/lib/instagram-image.py < jobs.json > results.json

Each job: { "src": <path>, "dst": <path>, "maxWidth": 1080 }
Each result: { "dst", "width", "height", "bytes" }

Why Python and not Node: this machine has no image encoder for Node (no sharp,
no jimp, and `magick`/`cwebp` are not installed), but it does have Pillow — which
is also what converted the four event photographs. The alternative was shipping
whatever the operator's phone produced, and an Instagram export is 2–4 MB against
a 120 KB WebP for the same picture.

Two details that are not optional:

  * MPO files — several phone JPEGs are really MPO, a first picture plus a depth
    map or thumbnail as the second frame. Pillow opens frame 0 by default, but
    `seek(0)` makes that explicit: without it the published image can be the
    depth map, which is grey mush.

  * EXIF orientation — a phone that writes orientation 8 stores the picture
    sideways with a rotate flag. Browsers honour the flag; a resized copy that
    drops EXIF does not, so it must be baked in with `exif_transpose` BEFORE the
    resize. One of the event photographs is exactly this case.

Saving to WebP without `exif=` drops the metadata, which is deliberate: phone
exports carry GPS coordinates, and the site publishes to the open web.
"""

import json
import os
import sys

from PIL import Image, ImageOps


def main() -> int:
    jobs = json.load(sys.stdin)
    results = []

    for job in jobs:
        src = job["src"]
        dst = job["dst"]
        max_width = int(job.get("maxWidth", 1080))

        with Image.open(src) as im:
            if im.format == "MPO":
                im.seek(0)

            im = ImageOps.exif_transpose(im)

            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")

            width, height = im.size
            if width > max_width:
                im = im.resize(
                    (max_width, round(height * max_width / width)),
                    Image.LANCZOS,
                )

            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im.save(dst, "WEBP", quality=82, method=6)

            results.append(
                {
                    "dst": dst,
                    "width": im.size[0],
                    "height": im.size[1],
                    "bytes": os.path.getsize(dst),
                }
            )

    json.dump(results, sys.stdout)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # surfaced verbatim by the Node caller
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
