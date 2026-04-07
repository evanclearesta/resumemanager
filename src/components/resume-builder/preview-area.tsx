"use client";

import type { ResumeContent, LayoutSettings } from "@/lib/types";

interface PreviewAreaProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewArea({ content, layoutSettings }: PreviewAreaProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-100 p-10">
      <div className="h-[842px] w-[595px] rounded bg-white p-10 shadow">
        <p className="text-center text-gray-400">PDF Preview (coming in Task 9)</p>
      </div>
    </div>
  );
}
