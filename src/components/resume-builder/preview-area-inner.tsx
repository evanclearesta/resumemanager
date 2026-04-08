"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePDF } from "@react-pdf/renderer";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import { ResumePDFDocument } from "./resume-pdf-document";

interface PreviewAreaInnerProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewAreaInner({ content, layoutSettings }: PreviewAreaInnerProps) {
  const [instance, update] = usePDF();
  const iframeARef = useRef<HTMLIFrameElement>(null);
  const iframeBRef = useRef<HTMLIFrameElement>(null);
  // State drives re-renders for crossfade; ref gives synchronous reads in effects
  const [activeIframe, setActiveIframe] = useState<"A" | "B">("A");
  const activeIframeForEffectRef = useRef<"A" | "B">("A");
  const firstLoadDoneRef = useRef(false);
  const displayUrlRef = useRef<string | null>(null);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const [progress, setProgress] = useState(0);

  const doc = <ResumePDFDocument content={content} layout={layoutSettings} />;
  useEffect(() => update(doc), [content, layoutSettings]);

  // Responsive scaling to fit A4 page within available space
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // 40px padding on each side = 80px total
      const availableWidth = width - 80;
      const availableHeight = height - 80;
      const scaleX = availableWidth / 595;
      const scaleY = availableHeight / 842;
      const newScale = Math.min(scaleX, scaleY, 1.5); // cap at 1.5x to avoid oversized iframes
      setScale(Math.max(newScale, 0.3)); // minimum 30%
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Start progress bar animation when PDF is regenerating
  useEffect(() => {
    if (!instance.loading || !firstLoadDoneRef.current) return;

    setProgress(0);

    let animationId: number;
    const startTime = performance.now();

    function animate() {
      const elapsed = performance.now() - startTime;
      const target = 85 * (1 - Math.exp(-elapsed / 400));
      setProgress(target);
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [instance.loading]);

  const handlePendingLoad = useCallback(() => {
    const next = activeIframeForEffectRef.current === "A" ? "B" : "A";
    activeIframeForEffectRef.current = next;
    setActiveIframe(next);
    setProgress(100);
    swapTimeoutRef.current = setTimeout(() => {
      setProgress(0);
      swapTimeoutRef.current = null;
    }, 300);
  }, []);

  // Clear swap timeout on unmount
  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current !== null) {
        clearTimeout(swapTimeoutRef.current);
      }
    };
  }, []);

  // Load new PDF into the pending (hidden) iframe; swap on load
  useEffect(() => {
    if (!instance.loading && instance.url && instance.url !== displayUrlRef.current) {
      displayUrlRef.current = instance.url;

      if (!firstLoadDoneRef.current) {
        firstLoadDoneRef.current = true;
        if (iframeARef.current) {
          iframeARef.current.src = `${instance.url}#toolbar=0`;
        }
        return;
      }

      const pendingRef = activeIframeForEffectRef.current === "A" ? iframeBRef : iframeARef;
      if (pendingRef.current) {
        pendingRef.current.onload = handlePendingLoad;
        pendingRef.current.src = `${instance.url}#toolbar=0`;
      }

      return () => {
        if (pendingRef.current) {
          pendingRef.current.onload = null;
        }
      };
    }
  }, [instance.loading, instance.url, handlePendingLoad]);

  const isLoading = !displayUrlRef.current && (instance.loading || !instance.url);

  return (
    <div ref={containerRef} className="relative flex flex-1 items-center justify-center overflow-hidden bg-gray-100">
      {isLoading ? (
        <div
          className="animate-pulse rounded bg-gray-200"
          style={{ width: 595 * scale, height: 842 * scale }}
        />
      ) : (
        <>
          {progress > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10 h-[3px]">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${progress}%`,
                  opacity: progress >= 100 ? 0 : 1,
                  transition: progress >= 100
                    ? "width 150ms ease-out, opacity 300ms ease-out"
                    : "width 100ms linear",
                }}
              />
            </div>
          )}

          <div className="relative rounded shadow-lg" style={{ width: 595 * scale, height: 842 * scale }}>
            <iframe
              ref={iframeARef}
              width="100%"
              height="100%"
              className="absolute inset-0 transition-opacity duration-150"
              style={{
                border: "none",
                opacity: activeIframe === "A" ? 1 : 0,
                zIndex: activeIframe === "A" ? 1 : 0,
              }}
            />
            <iframe
              ref={iframeBRef}
              width="100%"
              height="100%"
              className="absolute inset-0 transition-opacity duration-150"
              style={{
                border: "none",
                opacity: activeIframe === "B" ? 1 : 0,
                zIndex: activeIframe === "B" ? 1 : 0,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
