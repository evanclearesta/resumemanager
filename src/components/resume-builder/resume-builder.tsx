"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { PreviewArea } from "./preview-area";
import { Button } from "@/components/ui/button";
import { Download, Save, Pencil, Palette } from "lucide-react";
import { DEFAULT_CONTENT, DEFAULT_LAYOUT } from "@/lib/defaults";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

export function ResumeBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const resolved = useQuery(api.resumes.resolve, isNew ? "skip" : { id });
  const categories = useQuery(api.baseResumes.listCategories) ?? [];

  const resume = resolved;
  const isBranch = resolved?.type === "branch";
  const branchResume = isBranch ? resolved : null;

  const parentBase = useQuery(
    api.baseResumes.get,
    isBranch && resolved ? { id: resolved.baseResumeId } : "skip"
  );

  const createBase = useMutation(api.baseResumes.create);
  const updateBase = useMutation(api.baseResumes.update);
  const updateBranch = useMutation(api.branchResumes.update);

  const [content, setContent] = useState<ResumeContent>(DEFAULT_CONTENT);
  const [previewContent, setPreviewContent] = useState<ResumeContent>(DEFAULT_CONTENT);
  const [previewLayout, setPreviewLayout] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const hasCreated = useRef(false);
  const createdId = useRef<string | null>(null);
  const hasInitialized = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarOverlayRef = useRef<HTMLDivElement>(null);

  // Close sidebar overlay on click outside
  useEffect(() => {
    if (!sidebarOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (sidebarOverlayRef.current && !sidebarOverlayRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    if (resume && !hasInitialized.current) {
      hasInitialized.current = true;
      setContent(resume.content as ResumeContent);
      setPreviewContent(resume.content as ResumeContent);
      setLayoutSettings(resume.layoutSettings as LayoutSettings);
      setPreviewLayout(resume.layoutSettings as LayoutSettings);
      if ("category" in resume) setCategory((resume as any).category ?? "");
      setTitle((resume as any).title ?? "");
    }
  }, [resume]);

  const save = useCallback(
    async () => {
      if (isNew && !hasCreated.current) {
        hasCreated.current = true;
        const newTitle = `${content.contact.firstName} ${content.contact.lastName} - ${content.targetJobTitle} - Base Resume`.trim();
        const newId = await createBase({
          title: newTitle || "Untitled Resume",
          category: category || "Uncategorized",
          content,
          layoutSettings,
        });
        createdId.current = newId;
        setIsDirty(false);
        setPreviewContent(content);
        setPreviewLayout(layoutSettings);

        router.replace(`/resume/${newId}`);
      } else if (createdId.current || !isNew) {
        if (isBranch) {
          await updateBranch({
            id: (createdId.current ?? id) as Id<"branchResumes">,
            content,
            layoutSettings,
          });
        } else {
          const newTitle = `${content.contact.firstName} ${content.contact.lastName} - ${content.targetJobTitle} - Base Resume`.trim();
          await updateBase({
            id: (createdId.current ?? id) as Id<"baseResumes">,
            title: newTitle || "Untitled Resume",
            category: category || "Uncategorized",
            content,
            layoutSettings,
          });
        }
        setIsDirty(false);
        setPreviewContent(content);
        setPreviewLayout(layoutSettings);

      }
    },
    [isNew, id, isBranch, content, layoutSettings, category, createBase, updateBase, updateBranch, router]
  );

  function handleContentChange(newContent: ResumeContent) {
    setContent(newContent);
    setIsDirty(true);
  }

  function handleLayoutChange(newLayout: LayoutSettings) {
    setLayoutSettings(newLayout);
    setIsDirty(true);
  }

  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    setIsDirty(true);
  }

  function updatePreview() {
    setPreviewContent(content);
    setPreviewLayout(layoutSettings);
  }

  async function handleExport() {
    const { pdf } = await import("@react-pdf/renderer");
    const { ResumePDFDocument } = await import("./resume-pdf-document");
    const blob = await pdf(
      ResumePDFDocument({ content, layout: layoutSettings })
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const breadcrumb = isBranch && parentBase ? (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Home</Link>
      <span className="text-gray-400">&gt;</span>
      <span className="text-gray-500">{parentBase.category}</span>
      <span className="text-gray-400">&gt;</span>
      <span className="text-gray-500">{parentBase.title}</span>
      <span className="text-gray-400">&gt;</span>
      <span className="font-medium">{(branchResume as any)?.companyName} Branch</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Home</Link>
      <span className="text-gray-400">&gt;</span>
      <span className="font-medium">{title || "New Resume"}</span>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="flex h-14 items-center justify-between border-b bg-white px-3 md:px-6">
        {breadcrumb}
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={!isDirty} variant={isDirty ? "default" : "outline"}>
            <Save className="mr-2 h-4 w-4" />
            {isDirty ? "Save" : "Saved"}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      {isBranch && branchResume && (
        <div className="border-b bg-blue-50 px-6 py-2 text-sm text-blue-700">
          Branch of {parentBase?.title} &middot; {(branchResume as any).companyName}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon rail — visible only below lg */}
        <div className="flex w-12 shrink-0 flex-col items-center gap-3 border-r bg-white pt-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
            title="Editor"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-gray-100"
            title="Layout & Style"
          >
            <Palette className="h-4 w-4" />
          </button>
        </div>

        {/* Full sidebar — always visible at lg+ */}
        <div className="hidden lg:contents">
          <Sidebar
            content={content}
            layoutSettings={layoutSettings}
            category={category}
            categoryOptions={categories}
            onContentChange={handleContentChange}
            onLayoutChange={handleLayoutChange}
            onCategoryChange={handleCategoryChange}
            onBlur={updatePreview}
          />
        </div>

        {/* Sidebar overlay for narrow viewports */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" />
            <div
              ref={sidebarOverlayRef}
              className="fixed inset-y-0 left-12 z-50 lg:hidden"
            >
              <Sidebar
                content={content}
                layoutSettings={layoutSettings}
                category={category}
                categoryOptions={categories}
                onContentChange={handleContentChange}
                onLayoutChange={handleLayoutChange}
                onCategoryChange={handleCategoryChange}
                onBlur={updatePreview}
              />
            </div>
          </>
        )}

        <PreviewArea content={previewContent} layoutSettings={previewLayout} />
      </div>
    </div>
  );
}
