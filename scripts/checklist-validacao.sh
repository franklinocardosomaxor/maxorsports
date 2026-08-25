#!/usr/bin/env bash
# Checklist de validação do Maxor Kit.
#   bash scripts/checklist-validacao.sh
# Verifica: arquivos do kit, exports, assets, typecheck e rotas do dev server.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BASE_URL="${BASE_URL:-http://localhost:8080}"
PASS=0; FAIL=0

check() { # check <descrição> <comando...>
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "  OK    $label"; PASS=$((PASS+1))
  else
    echo "  FALHA $label"; FAIL=$((FAIL+1))
  fi
}

echo "== 1. Arquivos do kit =="
for f in src/maxor-kit/index.ts src/maxor-kit/tokens.ts src/maxor-kit/assets.ts \
         src/maxor-kit/README.md GUIA-INTEGRACAO-CRM.md docs/historico/HANDOFF-ANTIGRAVITY.md \
         scripts/pack-maxor-kit.sh scripts/integrar-maxor-kit.sh; do
  check "$f" test -f "$f"
done

echo "== 2. Exports esperados =="
for sym in maxorColors maxorFonts maxorGradients maxorRootCss MAXOR_ASSET_LIBRARY; do
  check "export $sym" grep -qE "\b$sym\b" src/maxor-kit/index.ts src/maxor-kit/tokens.ts src/maxor-kit/assets.ts
done

echo "== 3. Mídia e efeitos =="
check "logos de marcas" test -d src/assets/brands
check "efeito Aurora" test -f src/components/site/Aurora.tsx
check "efeito SplashCursor" test -f src/components/site/SplashCursor.tsx
check "efeito LogoLoop" test -f src/components/site/LogoLoop.tsx

echo "== 4. Typecheck =="
check "tsgo (sem erros de tipo)" npx tsgo --noEmit

echo "== 5. Rotas (dev server em $BASE_URL) =="
if curl -sf -o /dev/null "$BASE_URL/" 2>/dev/null; then
  for r in / /catalogo /categorias /lancamentos /marcas /masculino /feminino /infantil \
           /ofertas /checkout /login /minha-conta /kit-validador; do
    check "GET $r" curl -sf -o /dev/null "$BASE_URL$r"
  done
else
  echo "  (dev server indisponível — etapa de rotas ignorada)"
fi

echo
echo "== Resultado: $PASS OK / $FAIL FALHA =="
[ "$FAIL" -eq 0 ]
