import type { CatalogProduct } from "./CatalogPage";
import { MASCULINO, FEMININO } from "./catalog-data";

// Coleções exclusivas abertas pelo botão "Ver coleção" da home.
// Inclua novas variedades adicionando itens nos arrays abaixo.
export const COLECAO_MASCULINA: CatalogProduct[] = [...MASCULINO];

export const COLECAO_FEMININA: CatalogProduct[] = [...FEMININO];
