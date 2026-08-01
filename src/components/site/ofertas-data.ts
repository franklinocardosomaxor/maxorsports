/**
 * COMBO / PROMOÇÃO MONTADA
 * Estrutura pronta pra virar tabela no CRM (ex.: `promo_combos`) com:
 *   id, title, subtitle, icon_url, product_ids[], override_total?, active
 * Os PRODUTOS em si vêm sempre do CRM (`public.products` com
 * `site_visible = true`) — aqui só ficam os agrupamentos promocionais.
 */
export type PromoCombo = {
  id: string;
  title: string;
  subtitle?: string;
  /** URL do ícone/selo da promoção. Pode ser vazio. */
  iconUrl?: string;
  productIds: string[];
  /** Se definido, sobrescreve a soma automática (ex.: "leve 2 pague 1"). */
  overrideTotal?: number;
};

export const PROMO_COMBOS: PromoCombo[] = [];
