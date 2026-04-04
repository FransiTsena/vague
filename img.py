import os
from PIL import Image


def convert_images_to_webp(source_dir):
    for root, _, files in os.walk(source_dir):
        for file in files:
            lower_file = file.lower()
            if lower_file.endswith(".webp"):
                continue  # Skip already webp files
            if (
                lower_file.endswith(".jpg")
                or lower_file.endswith(".jpeg")
                or lower_file.endswith(".png")
            ):
                img_path = os.path.join(root, file)
                webp_path = os.path.splitext(img_path)[0] + ".webp"
                try:
                    with Image.open(img_path) as img:
                        img.save(webp_path, "webp")
                    print(f"Converted: {img_path} -> {webp_path}")
                except Exception as e:
                    print(f"Failed to convert {img_path}: {e}")


if __name__ == "__main__":
    convert_images_to_webp("public/photos")
