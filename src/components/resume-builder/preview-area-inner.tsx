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
  const activeIframeRef = useRef<"A" | "B">("A");
  const firstLoadDoneRef = useRef(false);
  const displayUrlRef = useRef<string | null>(null);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const doc = <ResumePDFDocument content={content} layout={layoutSettings} />;
  useEffect(() => update(doc), [content, layoutSettings]);

  // Start progress bar animation when PDF is regenerating
  useEffect(() => {
    if (!instance.loading || !firstLoadDoneRef.current) return;

    setIsRegenerating(true);
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
    activeIframeRef.current = activeIframeRef.current === "A" ? "B" : "A";
    setProgress(100);
    setTimeout(() => {
      setIsRegenerating(false);
      setProgress(0);
    }, 300);
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

      const pendingRef = activeIframeRef.current === "A" ? iframeBRef : iframeARef;
      if (pendingRef.current) {
        pendingRef.current.onload = handlePendingLoad;
        pendingRef.current.src = `${instance.url}#toolbar=0`;
      }
    }
  }, [instance.loading, instance.url, handlePendingLoad]);

  if (!displayUrlRef.current && (instance.loading || !instance.url)) {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
        <div className="h-[842px] w-[595px] animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
      {isRegenerating && (
        <div className="absolute top-0 left-0 right-0 z-10 h-[3px]">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
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

      <div className="relative h-[842px] w-[595px]">
        <iframe
          ref={iframeARef}
          width="100%"
          height="100%"
          className="absolute inset-0 rounded shadow-lg transition-opacity duration-150"
          style={{
            border: "none",
            opacity: activeIframeRef.current === "A" ? 1 : 0,
            zIndex: activeIframeRef.current === "A" ? 1 : 0,
          }}
        />
        <iframe
          ref={iframeBRef}
          width="100%"
          height="100%"
          className="absolute inset-0 rounded shadow-lg transition-opacity duration-150"
          style={{
            border: "none",
            opacity: activeIframeRef.current === "B" ? 1 : 0,
            zIndex: activeIframeRef.current === "B" ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}
