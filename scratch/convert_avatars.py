import os
from PIL import Image

team_dir = 'assets/images/team'
for i in range(1, 8):
    jpg_path = os.path.join(team_dir, f'member-{i}.jpg')
    webp_path = os.path.join(team_dir, f'member-{i}.webp')
    if os.path.exists(jpg_path):
        with Image.open(jpg_path) as im:
            im = im.convert('RGB')
            im.thumbnail((152, 152), Image.Resampling.LANCZOS)
            im.save(webp_path, 'WEBP', quality=82)
            orig_sz = os.path.getsize(jpg_path) / 1024
            webp_sz = os.path.getsize(webp_path) / 1024
            print(f'member-{i}: {orig_sz:.1f} KB -> {webp_sz:.1f} KB WebP')
