import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  type CSSProperties,
  type Key,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import "./LogoLoop.css";
import type React from "react";

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

export type LogoItem = {
  node?: ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
  ariaLabel?: string;
};

type LogoLoopProps = {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  /** Permite arrastar as logos e exibe uma barra de rolagem. */
  draggable?: boolean;
  renderItem?: (item: LogoItem, key: Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

const toCssLength = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : (value ?? undefined);

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  draggable = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}: LogoLoopProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const seqRef = useRef<HTMLUListElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const pointerDownRef = useRef(false);
  const movedRef = useRef(false);

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = direction === "left" ? 1 : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.getBoundingClientRect?.().width ?? 0;
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Re-measure on mount/remount (voltar para a home) até obter uma largura válida.
    let tries = 0;
    let raf = 0;
    const retry = () => {
      updateDimensions();
      const w = seqRef.current?.getBoundingClientRect?.().width ?? 0;
      if (w <= 0 && tries < 60) {
        tries += 1;
        raf = requestAnimationFrame(retry);
      }
    };
    raf = requestAnimationFrame(retry);

    if (!window.ResizeObserver) {
      window.addEventListener("resize", updateDimensions);
      updateDimensions();
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", updateDimensions);
      };
    }
    const observers = [containerRef, seqRef].map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(ref.current);
      return observer;
    });
    updateDimensions();
    return () => {
      cancelAnimationFrame(raf);
      observers.forEach((o) => o?.disconnect());
    };
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const images = seqRef.current?.querySelectorAll("img") ?? [];
    if (images.length === 0) {
      updateDimensions();
      return;
    }
    let remaining = images.length;
    const handleLoad = () => {
      remaining -= 1;
      if (remaining === 0) updateDimensions();
    };
    images.forEach((img) => {
      if (img.complete) handleLoad();
      else {
        img.addEventListener("load", handleLoad, { once: true });
        img.addEventListener("error", handleLoad, { once: true });
      }
    });
    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleLoad);
      });
    };
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const paused = isHovered || isDragging;
      const target = paused && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + (isDragging ? 0 : velocityRef.current * deltaTime);
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        const pct = Math.round((nextOffset / seqWidth) * 100);
        setScrollPct((prev) => (prev === pct ? prev : pct));
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, isDragging, effectiveHoverSpeed]);

  const applyOffset = useCallback(
    (next: number) => {
      if (seqWidth <= 0) return;
      const wrapped = ((next % seqWidth) + seqWidth) % seqWidth;
      offsetRef.current = wrapped;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
      }
      setScrollPct(Math.round((wrapped / seqWidth) * 100));
    },
    [seqWidth],
  );

  // Listeners nativos: a faixa se move constantemente, então o clique do
  // navegador se perde (pointerdown e pointerup caem em elementos distintos).
  // Detectamos o "tap" manualmente e navegamos para a página da marca.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      console.log("MX down");
      pointerDownRef.current = true;
      movedRef.current = false;
      dragStartXRef.current = e.clientX;
      dragStartOffsetRef.current = offsetRef.current;
      if (draggable) setIsDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      if (!pointerDownRef.current) return;
      const delta = e.clientX - dragStartXRef.current;
      if (!movedRef.current) {
        if (Math.abs(delta) < 6) return;
        movedRef.current = true;
      }
      if (draggable) applyOffset(dragStartOffsetRef.current - delta);
    };

    const onUp = (e: PointerEvent) => {
      console.log("MX up", pointerDownRef.current, movedRef.current, (e.target as HTMLElement)?.tagName);
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      console.log("MX a");
      setIsDragging(false);
      console.log("MX b", movedRef.current);
      if (movedRef.current) return;
      console.log("MX c");
      const link = (e.target as HTMLElement | null)?.closest?.(
        "a.logoloop__link",
      ) as HTMLAnchorElement | null;
      const href = link?.getAttribute("href");
      console.log("MX chain", (()=>{let n=e.target as HTMLElement|null,o=[];while(n){o.push(n.tagName+"."+(n.className&&n.className.toString().slice(0,20)));n=n.parentElement;}return o.join(" > ")})());
      if (!href || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (href.startsWith("/")) router.navigate({ to: href });
      else window.open(href, "_blank", "noopener,noreferrer");
    };

    const onCancel = () => {
      pointerDownRef.current = false;
      setIsDragging(false);
    };

    const onClick = (e: MouseEvent) => {
      if (movedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        movedRef.current = false;
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      el.removeEventListener("click", onClick, true);
    };
  }, [draggable, applyOffset, router]);


  const rootClassName = [
    "logoloop",
    "logoloop--horizontal",
    fadeOut && "logoloop--fade",
    scaleOnHover && "logoloop--scale-hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderLogoItem = useCallback(
    (item: LogoItem, key: Key) => {
      if (renderItem) {
        return (
          <li className="logoloop__item" key={key} role="listitem">
            {renderItem(item, key)}
          </li>
        );
      }
      const content = item.node ? (
        <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
          {item.node}
        </span>
      ) : (
        <img src={item.src} alt={item.alt ?? item.title ?? ""} title={item.title} loading="lazy" draggable={false} />
      );
      const itemAriaLabel = item.ariaLabel ?? item.title ?? item.alt;
      const itemContent = item.href ? (
        <a className="logoloop__link" href={item.href} aria-label={itemAriaLabel}>
          {content}
        </a>
      ) : (
        content
      );
      return (
        <li className="logoloop__item" key={key} role="listitem">
          {itemContent}
        </li>
      );
    },
    [renderItem],
  );

  const containerStyle: CSSProperties = {
    width: toCssLength(width) ?? "100%",
    ["--logoloop-gap" as string]: `${gap}px`,
    ["--logoloop-logoHeight" as string]: `${logoHeight}px`,
    ...(fadeOutColor ? { ["--logoloop-fadeColor" as string]: fadeOutColor } : {}),
    ...style,
  };

  return (
    <div>
      <div
        ref={containerRef}
        className={rootClassName}
        style={{ ...containerStyle, cursor: draggable ? (isDragging ? "grabbing" : "grab") : undefined }}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="logoloop__track" ref={trackRef}>
          {Array.from({ length: copyCount }, (_, copyIndex) => (
            <ul
              className="logoloop__list"
              key={`copy-${copyIndex}`}
              role="list"
              aria-hidden={copyIndex > 0}
              ref={copyIndex === 0 ? seqRef : undefined}
            >
              {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
            </ul>
          ))}
        </div>
      </div>

      {draggable && (
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={scrollPct}
          aria-label="Rolar marcas"
          onChange={(e) => applyOffset((Number(e.target.value) / 100) * seqWidth)}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          className="logoloop__scrollbar"
        />
      )}
    </div>
  );

});

export default LogoLoop;
