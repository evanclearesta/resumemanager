# Smooth Preview Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the preview flash/blip when resume content changes by using a dual-iframe swap with a fake-determinate progress bar.

**Architecture:** Two iframes are stacked in the DOM. The "active" one shows the current PDF; the "pending" one loads the new PDF offscreen. When the pending iframe's `load` event fires, they swap via a CSS opacity crossfade. A thin progress bar at the top of the preview area provides visual feedback during regeneration.

**Tech Stack:** React (hooks, refs, state), `@react-pdf/renderer` (`usePDF` hook), Tailwind CSS, `requestAnimationFrame`

---

### Task 1: Add dual-iframe refs and swap state

**Files:**
- Modify: `src/components/resume-builder/preview-area-inner.tsx`

- [ ] **Step 1: Replace single iframe ref with dual-iframe refs and active tracker**

In `preview-area-inner.tsx`, replace the existing refs:

```tsx
// REMOVE these lines:
const displayUrlRef = useRef<string | null>(null);
const iframeRef = useRef<HTMLIFrameElement>(null);

// ADD these lines:
const iframeARef = useRef<HTMLIFrameElement>(null);
const iframeBRef = useRef<HTMLIFrameElement>(null);
const activeIframeRef = useRef<"A" | "B">("A");
const firstLoadDoneRef = useRef(false);
const displayUrlRef = useRef<string | null>(null);
```

`activeIframeRef` tracks which iframe is currently visible. `firstLoadDoneRef` gates the dual-iframe behavior so initial load still uses the skeleton.

- [ ] **Step 2: Add regeneration state and progress state**

Below the refs, add:

```tsx
const [isRegenerating, setIsRegenerating] = useState(false);
const [progress, setProgress] = useState(0);
```

Update the import at the top of the file:

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/resume-builder/preview-area-inner.tsx
git commit -m "refactor: add dual-iframe refs and regeneration state"
```

---

### Task 2: Implement the fake-determinate progress animation

**Files:**
- Modify: `src/components/resume-builder/preview-area-inner.tsx`

- [ ] **Step 1: Add progress animation effect**

After the existing `useEffect(() => update(doc), ...)`, add this effect that starts the progress bar when `instance.loading` becomes true:

```tsx
// Start progress bar animation when PDF is regenerating
useEffect(() => {
  if (!instance.loading || !firstLoadDoneRef.current) return;

  setIsRegenerating(true);
  setProgress(0);

  let animationId: number;
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    // Fast start, decelerating toward 85%
    // At 500ms -> ~70%, at 1000ms -> ~80%, asymptotes at 85%
    const target = 85 * (1 - Math.exp(-elapsed / 400));
    setProgress(target);
    animationId = requestAnimationFrame(animate);
  }

  animationId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(animationId);
}, [instance.loading]);
```

This uses an exponential ease-out curve. It fills quickly at first (~70% in 500ms) and decelerates toward 85%.

- [ ] **Step 2: Commit**

```bash
git add src/components/resume-builder/preview-area-inner.tsx
git commit -m "feat: add fake-determinate progress bar animation"
```

---

### Task 3: Implement dual-iframe swap logic

**Files:**
- Modify: `src/components/resume-builder/preview-area-inner.tsx`

- [ ] **Step 1: Create the onLoad handler**

Add this callback before the effects:

```tsx
const handlePendingLoad = useCallback(() => {
  // Swap active iframe
  activeIframeRef.current = activeIframeRef.current === "A" ? "B" : "A";

  // Complete progress bar
  setProgress(100);

  // Fade out progress bar after transition completes
  setTimeout(() => {
    setIsRegenerating(false);
    setProgress(0);
  }, 300);
}, []);
```

- [ ] **Step 2: Replace the double-buffer effect with dual-iframe swap logic**

Replace the existing double-buffer effect (the `useEffect` that checks `!instance.loading && instance.url`) with:

```tsx
// Load new PDF into the pending (hidden) iframe; swap on load
useEffect(() => {
  if (!instance.loading && instance.url && instance.url !== displayUrlRef.current) {
    displayUrlRef.current = instance.url;

    if (!firstLoadDoneRef.current) {
      // First load: set iframe A directly and mark as done
      firstLoadDoneRef.current = true;
      if (iframeARef.current) {
        iframeARef.current.src = `${instance.url}#toolbar=0`;
      }
      return;
    }

    // Subsequent loads: load into pending iframe
    const pendingRef = activeIframeRef.current === "A" ? iframeBRef : iframeARef;
    if (pendingRef.current) {
      pendingRef.current.onload = handlePendingLoad;
      pendingRef.current.src = `${instance.url}#toolbar=0`;
    }
  }
}, [instance.loading, instance.url, handlePendingLoad]);
```

On first load, it directly sets iframe A (just like the old behavior). On subsequent loads, it sets the pending iframe's `src` and attaches the `onload` handler that triggers the swap.

- [ ] **Step 3: Commit**

```bash
git add src/components/resume-builder/preview-area-inner.tsx
git commit -m "feat: implement dual-iframe swap on PDF load"
```

---

### Task 4: Update the JSX with dual iframes and progress bar

**Files:**
- Modify: `src/components/resume-builder/preview-area-inner.tsx`

- [ ] **Step 1: Replace the return JSX**

Replace the current return block (the one with the single iframe, NOT the skeleton early-return) with:

```tsx
return (
  <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
    {/* Progress bar */}
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

    {/* PDF preview container - relative for iframe positioning */}
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
```

Key details:
- Both iframes are inside a fixed-size container matching A4 dimensions (842x595px), matching the skeleton dimensions.
- `activeIframeRef.current` is a ref (not state) so reading it in render works — but we need a re-render to pick up changes. The `setIsRegenerating` and `setProgress` state changes in `handlePendingLoad` already trigger the necessary re-render.
- `transition-opacity duration-150` on each iframe produces the crossfade.
- The progress bar uses a faster `width` transition during animation, and a slower `opacity` fade-out when reaching 100%.

- [ ] **Step 2: Update the skeleton early-return to use the same container structure**

Replace the skeleton early-return:

```tsx
if (!displayUrlRef.current && (instance.loading || !instance.url)) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
      <div className="h-[842px] w-[595px] animate-pulse rounded bg-gray-200" />
    </div>
  );
}
```

(Only change: `flex` wrapper now also has `relative` to match the main return — keeps layout consistent during skeleton-to-content transition.)

- [ ] **Step 3: Commit**

```bash
git add src/components/resume-builder/preview-area-inner.tsx
git commit -m "feat: add dual iframes and progress bar to preview JSX"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify initial load**

1. Open the resume builder page
2. Confirm: skeleton (gray pulsing box) shows briefly, then PDF renders in place
3. Confirm: no progress bar visible during initial load

- [ ] **Step 3: Verify smooth transitions**

1. Edit any text field in the sidebar (e.g., name, summary)
2. Click outside the field (blur) to trigger preview update
3. Confirm: thin blue progress bar appears at the top of the preview area
4. Confirm: progress bar fills quickly to ~80%, then slows down
5. Confirm: old PDF stays visible the entire time (no blank flash)
6. Confirm: new PDF fades in smoothly when ready
7. Confirm: progress bar jumps to 100% and fades out

- [ ] **Step 4: Verify rapid edits**

1. Quickly edit and blur multiple fields in succession
2. Confirm: no visual glitches, progress bar resets correctly each time
3. Confirm: preview always shows a valid PDF (never blank)

- [ ] **Step 5: Commit final state**

If any fixes were needed during verification:

```bash
git add src/components/resume-builder/preview-area-inner.tsx
git commit -m "fix: polish smooth preview transitions"
```

---

### Complete File Reference

For context, here is what the final `preview-area-inner.tsx` should look like after all tasks:

```tsx
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
```
