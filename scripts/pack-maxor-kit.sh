#!/usr/bin/env bash
# Empacota o MAXOR KIT (imagens, efeitos, componentes, dados e server functions)
# num tarball pronto para ser descompactado dentro do repositório do CRM Maxor.
#
#   bash scripts/pack-maxor-kit.sh
#   -> /mnt/documents/maxor-kit.tgz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${OUT_DIR:-/mnt/documents}"
STAGE="$(mktemp -d)/maxor-kit"
mkdir -p "$STAGE/src"

copy() { # copy <path relativo ao projeto>
  local rel="$1"
  [ -e "$ROOT/$rel" ] || { echo "faltando: $rel" >&2; return 0; }
  mkdir -p "$STAGE/$(dirname "$rel")"
  cp -R "$ROOT/$rel" "$STAGE/$rel"
}

# --- kit + guias ------------------------------------------------------------
copy src/maxor-kit
copy GUIA-INTEGRACAO-CRM.md
copy HANDOFF-ANTIGRAVITY.md

# --- estilos e tokens -------------------------------------------------------
copy src/styles.css

# --- componentes e efeitos --------------------------------------------------
for f in Aurora.tsx SplashCursor.tsx LogoLoop.tsx LogoLoop.css Shell.tsx \
         CatalogPage.tsx ProductMiniCard.tsx catalog-data.ts ofertas-data.ts \
         brands-data.ts roupas-data.ts colecao-data.ts; do
  copy "src/components/site/$f"
done
copy src/components/ui
copy src/hooks/use-mobile.tsx

# --- lógica, dados e server functions ---------------------------------------
for f in catalog.ts cart.tsx product-media.ts utils.ts \
         buyer.functions.ts favorites.functions.ts \
         crm.contacts.functions.ts crm.deals.functions.ts \
         crm.activities.functions.ts crm.image-search.functions.ts \
         crm.import.functions.ts crm.email.functions.ts \
         crm.whatsapp.functions.ts; do
  copy "src/lib/$f"
done

# --- mídia ------------------------------------------------------------------
copy src/assets

# --- manifesto --------------------------------------------------------------
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const need = ["react","react-dom","@tanstack/react-router","@tanstack/react-start",
  "@supabase/supabase-js","tailwindcss","@tailwindcss/vite","ogl","lucide-react",
  "sonner","zod","clsx","tailwind-merge","class-variance-authority"];
const deps = Object.fromEntries(need.filter(d => pkg.dependencies[d]).map(d => [d, pkg.dependencies[d]]));
fs.writeFileSync(process.argv[2], JSON.stringify({
  name: "@maxor/kit",
  version: "1.0.0",
  private: true,
  description: "Biblioteca de imagem, funcionalidades e efeitos do site Maxor Sports para uso no CRM Maxor.",
  main: "src/maxor-kit/index.ts",
  peerDependencies: deps,
}, null, 2) + "\n");
' "$ROOT/package.json" "$STAGE/package.json"

( cd "$STAGE" && find . -type f | sort > MANIFEST.txt )

mkdir -p "$OUT_DIR"
tar -czf "$OUT_DIR/maxor-kit.tgz" -C "$(dirname "$STAGE")" maxor-kit
echo "gerado: $OUT_DIR/maxor-kit.tgz ($(du -h "$OUT_DIR/maxor-kit.tgz" | cut -f1))"
