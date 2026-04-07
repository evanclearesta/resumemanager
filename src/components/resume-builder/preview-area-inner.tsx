"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePDF } from "@react-pdf/renderer";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import { ResumePDFDocument } from "./resume-pdf-document";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.25;

interface PreviewAreaInnerProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewAreaInner({ content, layoutSettings }: PreviewAreaInnerProps) {
  const [instance, update] = usePDF();
  const iframeARef = useRef<HTMLIFrameElement>(null);
  const iframeBRef = useRef<HTMLIFrameElement>(null);
  const [activeIframe, setActiveIframe] = useState<"A" | "B">("A");
  const activeIframeForEffectRef = useRef<"A" | "B">("A");
  const firstLoadDoneRef = useRef(false);
  const displayUrlRef = useRef<string | null>(null);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);
  const zoomReset = useCallback(() => setZoom(1), []);

  const doc = <ResumePDFDocument content={content} layout={layoutSettings} />;
  useEffect(() => update(doc), [content, layoutSettings]);

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

  if (!displayUrlRef.current && (instance.loading || !instance.url)) {
    return (
      <div className="relative flex-1 overflow-auto bg-gray-100">
        <div className="mx-auto py-10" style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}>
          <div className="h-full w-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-auto bg-gray-100">
      {/* Progress bar */}
      {progress > 0 && (
        <div className="sticky top-0 left-0 right-0 z-10 h-[3px]">
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

      {/* Zoom toolbar */}
      <div className="sticky top-3 right-3 z-20 ml-auto mr-3 flex w-fit items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[3ch] text-center text-xs text-gray-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-gray-200" />
        <button
          onClick={zoomReset}
          disabled={zoom === 1}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* PDF page — scaled wrapper for correct scroll size */}
      <div
        className="mx-auto py-10"
        style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom }}
      >
        <div
          className="relative"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            ref={iframeARef}
            width="100%"
            height="100%"
            className="absolute inset-0 rounded shadow-lg transition-opacity duration-150"
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
            className="absolute inset-0 rounded shadow-lg transition-opacity duration-150"
            style={{
              border: "none",
              opacity: activeIframe === "B" ? 1 : 0,
              zIndex: activeIframe === "B" ? 1 : 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
