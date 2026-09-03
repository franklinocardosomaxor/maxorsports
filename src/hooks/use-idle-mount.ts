import { useEffect, useState } from "react";

/**
 * Só libera efeitos visuais pesados (WebGL/animação contínua) depois que a
 * página terminou de hidratar e o navegador ficou ocioso.
 *
 * Por que isso importa: Aurora e SplashCursor rodam laços de animação a cada
 * quadro. Quando eles subiam junto com a hidratação, o React — que hidrata o
 * conteúdo da rota em prioridade ociosa — nunca conseguia uma janela livre e a
 * página ficava congelada no HTML do servidor ("0 produtos", "EM BREVE") até o
 * visitante clicar em algum lugar. Adiando o start dos efeitos, o conteúdo
 * aparece sozinho e os efeitos entram logo depois.
 */
export function useIdleMount(delayMs = 600): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) setReady(true);
    };

    const idle = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;

    const timer = window.setTimeout(() => {
      if (idle) idle(start, { timeout: 2000 });
      else start();
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [delayMs]);

  return ready;
}
