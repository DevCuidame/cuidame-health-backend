#!/bin/bash
echo "🧹 Limpieza completa y recompilación..."
pm2 stop 0
rm -rf dist/
npx tsc --build --force
pm2 restart 0
echo "✅ Listo!"