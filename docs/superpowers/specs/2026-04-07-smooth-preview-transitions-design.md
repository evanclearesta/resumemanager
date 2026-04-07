# Smooth Preview Transitions

## Problem

The resume preview flashes/blips when content changes. When the iframe `src` is swapped to a new PDF blob URL, the old content disappears before the new PDF paints, causing a jarring blank frame.

## Solution

Dual-iframe swap with a fake-determinate progress bar. All changes scoped to `preview-area-inner.tsx`.

## Design

### Dual-Iframe Pattern

- Two iframes exist in the DOM, absolutely positioned and stacked on top of each other.
- One is "active" (visible, `opacity: 1`), the other is "pending" (hidden, `opacity: 0`).
- When a new PDF URL arrives from `usePDF()`, it loads into the pending iframe.
- On the pending iframe's `load` event, swap visibility: pending becomes active, active becomes pending.
- CSS `transition-opacity duration-150` provides a ~150ms crossfade.
- Initial load still uses the existing skeleton pattern; dual-iframe behavior only activates after the first PDF renders.

### Fake-Determinate Progress Bar

- Thin bar (3px) at the very top of the preview container, absolutely positioned with `z-10`.
- Animated with CSS transitions on `width`.
- Progress easing: quickly fills to ~85% (using a decelerating requestAnimationFrame loop), then holds.
- When the new iframe fires `load`, jumps to 100% and fades out after 300ms.
- Only visible during PDF regeneration.

### State & Refs

**New refs:**
- `iframeARef`, `iframeBRef` — the two iframes
- `activeIframe` — ref tracking which iframe is currently visible (`'A'` or `'B'`)

**New state:**
- `isRegenerating` — boolean, true from `instance.loading` becoming true until new iframe `load` fires
- `progress` — number (0-100), drives progress bar width

### Flow

1. User edits content, blurs field -> `updatePreview()` copies editing state to preview state.
2. `usePDF()` detects prop changes -> `instance.loading = true` -> start progress bar animation.
3. `instance.loading = false`, new `instance.url` available -> set pending iframe `src`.
4. Pending iframe `load` fires -> swap active/pending iframes (crossfade), set progress to 100%, fade out bar after 300ms.

### Component Structure

```tsx
<div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
  {/* Progress bar */}
  {isRegenerating && (
    <div className="absolute top-0 left-0 right-0 z-10 h-[3px]">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  )}

  {/* Dual iframes - both always in DOM, toggle opacity */}
  <iframe
    ref={iframeARef}
    className="absolute inset-0 h-full w-full transition-opacity duration-150"
    style={{ opacity: activeIframe === 'A' ? 1 : 0, zIndex: activeIframe === 'A' ? 1 : 0 }}
  />
  <iframe
    ref={iframeBRef}
    className="absolute inset-0 h-full w-full transition-opacity duration-150"
    style={{ opacity: activeIframe === 'B' ? 1 : 0, zIndex: activeIframe === 'B' ? 1 : 0 }}
  />
</div>
```

## Trigger

Preview updates on blur only (existing behavior). No debounce or live preview.

## Files Modified

- `src/components/resume-builder/preview-area-inner.tsx` — sole file changed

## Out of Scope

- Live/debounced preview on keystroke
- Canvas-based rendering
- Multi-page scroll synchronization
