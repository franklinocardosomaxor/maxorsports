#!/usr/bin/env bash
# Integra o MAXOR KIT dentro do repositório do CRM Maxor.
#
# Uso (dentro do repositório do CRM):
#   bash integrar-maxor-kit.sh /caminho/para/maxor-kit.tgz
#
# O que faz:
#   1. Descompacta o kit em ./maxor-kit-tmp
#   2. Copia src/maxor-kit, componentes, efeitos, libs e assets para o CRM
#   3. Lista as dependências que faltam (peerDependencies do kit)
#   4. Injeta o import dos estilos e imprime o CSS :root dos tokens
set -euo pipefail

TARBALL="${1:-maxor-kit.tgz}"
CRM_ROOT="$(pwd)"
TMP="$CRM_ROOT/maxor-kit-tmp"

[ -f "$TARBALL" ] || { echo "ERRO: pacote não encontrado: $TARBALL" >&2; exit 1; }
[ -d "$CRM_ROOT/src" ] || { echo "ERRO: rode este script na raiz do repositório do CRM (sem ./src)" >&2; exit 1; }

echo "==> 1/4 descompactando $TARBALL"
rm -rf "$TMP"; mkdir -p "$TMP"
tar -xzf "$TARBALL" -C "$TMP" --strip-components=1

echo "==> 2/4 copiando arquivos do kit"
copy_tree() {
  local rel="$1"
  [ -e "$TMP/$rel" ] || { echo "    (ausente no pacote) $rel"; return 0; }
  mkdir -p "$CRM_ROOT/$(dirname "$rel")"
  cp -R "$TMP/$rel" "$CRM_ROOT/$(dirname "$rel")/"
  echo "    + $rel"
}

copy_tree src/maxor-kit
copy_tree src/components/site
copy_tree src/components/ui
copy_tree src/hooks
copy_tree src/lib
copy_tree src/assets
copy_tree GUIA-INTEGRACAO-CRM.md
copy_tree docs/historico/HANDOFF-ANTIGRAVITY.md

# styles.css do kit vira referência, não sobrescreve o do CRM
if [ -f "$TMP/src/styles.css" ]; then
  cp "$TMP/src/styles.css" "$CRM_ROOT/src/maxor-kit/styles.maxor.css"
  echo "    + src/maxor-kit/styles.maxor.css (importe no seu styles.css)"
fi

echo "==> 3/4 conferindo dependências"
node -e '
const fs = require("fs");
const kit = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const crmPath = process.argv[2];
const crm = fs.existsSync(crmPath) ? JSON.parse(fs.readFileSync(crmPath, "utf8")) : { dependencies: {} };
const have = { ...(crm.dependencies||{}), ...(crm.devDependencies||{}) };
const missing = Object.entries(kit.peerDependencies || {}).filter(([d]) => !have[d]);
if (!missing.length) { console.log("    todas as dependências já existem no CRM"); process.exit(0); }
console.log("    faltando — rode:");
console.log("    npm i " + missing.map(([d,v]) => `${d}@${v}`).join(" "));
' "$TMP/package.json" "$CRM_ROOT/package.json"

echo "==> 4/4 tokens de tema"
cat <<'EOS'
    Adicione no topo do seu src/styles.css:
      @import "./maxor-kit/styles.maxor.css";

    Ou injete os tokens em runtime:
      import { maxorRootCss } from "@/maxor-kit";
      // <style dangerouslySetInnerHTML={{ __html: maxorRootCss() }} />

    Confirme o alias "@" -> ./src no tsconfig.json e no vite.config.ts.
EOS

rm -rf "$TMP"
echo "==> integração concluída. Valide com: bash scripts/checklist-validacao.sh"
