"use client";

import dynamic from "next/dynamic";
import type { ResumeContent, LayoutSettings } from "@/lib/types";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

const ResumePDFDocumentDynamic = dynamic(
  () => import("./resume-pdf-document").then((mod) => ({ default: mod.ResumePDFDocument })),
  { ssr: false }
);

interface PreviewAreaProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewArea({ content, layoutSettings }: PreviewAreaProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
      <PDFViewer width="100%" height="100%" showToolbar={false} className="rounded shadow-lg">
        <ResumePDFDocumentDynamic content={content} layout={layoutSettings} />
      </PDFViewer>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-[842px] w-[595px] animate-pulse rounded bg-gray-200" />
    </div>
  );
}
