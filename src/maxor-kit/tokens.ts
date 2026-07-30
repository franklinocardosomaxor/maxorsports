/**
 * MAXOR KIT — Design tokens
 *
 * Fonte única de verdade da identidade visual Maxor Sports.
 * Espelha as variáveis CSS declaradas em `src/styles.css` para que o CRM
 * possa consumir os mesmos valores em JS (charts, canvas, e-mails, PDFs).
 */

export const maxorColors = {
  navy: "#0F1720",
  cyan: "#00BFC6",
  mint: "#7EEBC1",
  lime: "#C7F500",
  cream: "#F7F8F5",
  /** Superfícies do tema escuro */
  surface: "#16232E",
  surfaceAlt: "#1B2A36",
  muted: "#9FB1BD",
  border: "rgba(126, 235, 193, 0.14)",
  destructive: "#e5484d",
} as const;

export const maxorFonts = {
  display: '"Rajdhani", ui-sans-serif, system-ui, sans-serif',
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
} as const;

export const maxorGradients = {
  /** Barra/realce padrão da marca */
  brand: `linear-gradient(90deg, ${maxorColors.cyan} 0%, ${maxorColors.mint} 55%, ${maxorColors.lime} 100%)`,
  /** Texto com degradê (usar com background-clip: text) */
  brandText: `linear-gradient(90deg, ${maxorColors.cyan} 0%, ${maxorColors.lime} 100%)`,
  /** Cabeçalhos de coleção */
  header: `linear-gradient(135deg, ${maxorColors.navy} 0%, #16232E 60%, rgba(0,191,198,0.25) 100%)`,
} as const;

/** Cores de destaque aceitas pelos componentes do kit. */
export const maxorAccents = ["cyan", "mint", "lime"] as const;
export type MaxorAccent = (typeof maxorAccents)[number];

export const accentHex: Record<MaxorAccent, string> = {
  cyan: maxorColors.cyan,
  mint: maxorColors.mint,
  lime: maxorColors.lime,
};

/** Variáveis CSS a injetar em ambientes fora deste projeto (ex.: shell do CRM). */
export const maxorCssVariables: Record<string, string> = {
  "--navy": maxorColors.navy,
  "--cyan-brand": maxorColors.cyan,
  "--mint": maxorColors.mint,
  "--lime-brand": maxorColors.lime,
  "--cream": maxorColors.cream,
  "--offwhite": maxorColors.cream,
  "--background": maxorColors.navy,
  "--foreground": maxorColors.cream,
  "--card": maxorColors.surface,
  "--card-foreground": maxorColors.cream,
  "--primary": maxorColors.cyan,
  "--primary-foreground": maxorColors.navy,
  "--secondary": maxorColors.surfaceAlt,
  "--muted": maxorColors.surfaceAlt,
  "--muted-foreground": maxorColors.muted,
  "--accent": maxorColors.mint,
  "--accent-foreground": maxorColors.navy,
  "--border": maxorColors.border,
  "--ring": maxorColors.cyan,
};

/** Bloco `:root { ... }` pronto para colar/injetar no CSS do CRM. */
export function maxorRootCss(): string {
  const body = Object.entries(maxorCssVariables)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${body}\n}`;
}
