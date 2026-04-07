"use client";

import type { LayoutSettings } from "@/lib/types";

interface LayoutStyleTabProps {
  layout: LayoutSettings;
  onChange: (layout: LayoutSettings) => void;
}

export function LayoutStyleTab({ layout, onChange }: LayoutStyleTabProps) {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-500">Layout & Style settings (coming in Task 8)</p>
    </div>
  );
}
