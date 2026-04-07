"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { PreviewArea } from "./preview-area";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { DEFAULT_CONTENT, DEFAULT_LAYOUT } from "@/lib/defaults";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

export function ResumeBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const baseResume = useQuery(api.baseResumes.get, isNew ? "skip" : { id: id as Id<"baseResumes"> });
  const branchResume = useQuery(
    api.branchResumes.get,
    isNew || baseResume !== undefined ? "skip" : { id: id as Id<"branchResumes"> }
  );
  const categories = useQuery(api.baseResumes.listCategories) ?? [];

  const resume = baseResume ?? branchResume;
  const isBranch = branchResume !== null && branchResume !== undefined;

  const parentBase = useQuery(
    api.baseResumes.get,
    isBranch && branchResume ? { id: branchResume.baseResumeId } : "skip"
  );

  const createBase = useMutation(api.baseResumes.create);
  const updateBase = useMutation(api.baseResumes.update);
  const updateBranch = useMutation(api.branchResumes.update);

  const [content, setContent] = useState<ResumeContent>(DEFAULT_CONTENT);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const hasCreated = useRef(false);
  const createdId = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (resume) {
      setContent(resume.content as ResumeContent);
      setLayoutSettings(resume.layoutSettings as LayoutSettings);
      if ("category" in resume) setCategory((resume as any).category ?? "");
      setTitle((resume as any).title ?? "");
    }
  }, [resume]);

  const save = useCallback(
    (newContent: ResumeContent, newLayout: LayoutSettings, newCategory: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (isNew && !hasCreated.current) {
          hasCreated.current = true;
          const newTitle = `${newContent.contact.firstName} ${newContent.contact.lastName} - ${newContent.targetJobTitle} - Base Resume`.trim();
          const newId = await createBase({
            title: newTitle || "Untitled Resume",
            category: newCategory || "Uncategorized",
            content: newContent,
            layoutSettings: newLayout,
          });
          createdId.current = newId;
          router.replace(`/resume/${newId}`);
        } else if (createdId.current || !isNew) {
          const resumeId = (createdId.current ?? id) as Id<"baseResumes">;
          if (isBranch) {
            await updateBranch({
              id: resumeId as unknown as Id<"branchResumes">,
              content: newContent,
              layoutSettings: newLayout,
            });
          } else {
            const newTitle = `${newContent.contact.firstName} ${newContent.contact.lastName} - ${newContent.targetJobTitle} - Base Resume`.trim();
            await updateBase({
              id: resumeId,
              title: newTitle || "Untitled Resume",
              category: newCategory || "Uncategorized",
              content: newContent,
              layoutSettings: newLayout,
            });
          }
        }
      }, 500);
    },
    [isNew, id, isBranch, createBase, updateBase, updateBranch, router]
  );

  function handleContentChange(newContent: ResumeContent) {
    setContent(newContent);
    save(newContent, layoutSettings, category);
  }

  function handleLayoutChange(newLayout: LayoutSettings) {
    setLayoutSettings(newLayout);
    save(content, newLayout, category);
  }

  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    save(content, layoutSettings, newCategory);
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
      <div className="flex h-14 items-center justify-between border-b bg-white px-6">
        {breadcrumb}
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      {isBranch && branchResume && (
        <div className="border-b bg-blue-50 px-6 py-2 text-sm text-blue-700">
          Branch of {parentBase?.title} &middot; {(branchResume as any).companyName}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          content={content}
          layoutSettings={layoutSettings}
          category={category}
          categoryOptions={categories}
          onContentChange={handleContentChange}
          onLayoutChange={handleLayoutChange}
          onCategoryChange={handleCategoryChange}
        />
        <PreviewArea content={content} layoutSettings={layoutSettings} />
      </div>
    </div>
  );
}
