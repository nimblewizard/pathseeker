#!/bin/sh
# Rebuild artifact.html (claude.ai artifact) and index.html (static hosting) from parts.
cd "$(dirname "$0")" || exit 1
cat part1.html part2.html mapimg.html bgimg.html mapsimg.html photosimg.html part3.html > artifact.html
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  printf '<link rel="manifest" href="manifest.webmanifest">\n'
  printf '<meta name="theme-color" content="#120d06">\n'
  printf '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
  printf '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  printf '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
  printf '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n'
  cat part1.html
  printf '</head>\n<body>\n'
  cat part2.html mapimg.html bgimg.html mapsimg.html photosimg.html part3.html sw-register.html
  printf '</body>\n</html>\n'
} > index.html
echo "built artifact.html ($(wc -c < artifact.html | tr -d ' ') bytes) and index.html ($(wc -c < index.html | tr -d ' ') bytes)"
