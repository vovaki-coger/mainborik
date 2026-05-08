# Иконки для Electron-приложения

Перед сборкой добавь иконки в эту папку:

| Файл | Размер | Для |
|------|--------|-----|
| `icon.png` | 512×512 px | Linux |
| `icon.ico` | 256×256 (multi-size) | Windows |
| `icon.icns` | 512×512 (multi-size) | macOS |

## Как создать иконки

### Из PNG (online):
1. Нарисуй/скачай PNG 512×512
2. Конвертируй в .ico: https://icoconvert.com
3. Конвертируй в .icns: https://cloudconvert.com/png-to-icns

### Через ImageMagick (Linux/macOS):
```bash
# .ico из .png
convert icon.png -resize 256x256 icon.ico

# .icns из .png (macOS)
mkdir icon.iconset
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
iconutil -c icns icon.iconset
```

Без иконок electron-builder использует иконку Electron по умолчанию.
