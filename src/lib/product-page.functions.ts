/**
 * Server function pública (somente leitura) para a página de produto.
 * Permite que o loader de /produto/$id funcione no SSR — acesso direto,
 * reload e links compartilhados não caem mais em 404.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchProductPageData } from "./product-page.server";

export const getProductPageData = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => fetchProductPageData(data.id));
