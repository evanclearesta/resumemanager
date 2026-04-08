"use client";

import dynamic from "next/dynamic";
import type { ResumeContent, LayoutSettings } from "@/lib/types";

interface PreviewAreaProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

function PreviewSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
      <div className="h-[842px] w-[595px] animate-pulse rounded bg-gray-200" />
    </div>
  );
}

const PreviewAreaInner = dynamic(
  () => import("./preview-area-inner").then((mod) => mod.PreviewAreaInner),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

export function PreviewArea({ content, layoutSettings }: PreviewAreaProps) {
  return <PreviewAreaInner content={content} layoutSettings={layoutSettings} />;
}
