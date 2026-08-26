// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Vite valida o header Host de toda requisição contra server.allowedHosts.
  // Em ambientes de sandbox/preview, o domínio público (visto pelo navegador
  // dentro do iframe) é reescrito por um proxy e pode não bater com o que o
  // Vite dev server espera — nesse caso ele bloqueia a request silenciosamente
  // ("Blocked request. This host is not allowed"), o que aparece como tela
  // branca dentro do iframe do editor. allowedHosts: true desativa essa
  // checagem SOMENTE no dev server (não afeta o build/produção, que não passa
  // por essa validação).
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
