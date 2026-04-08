"use client";

import { Pencil, Copy, Trash2, FileText, GitBranch, Plus, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { BranchStatus } from "@/lib/types";

interface ResumeCardProps {
  resume: Doc<"baseResumes">;
  branches: Doc<"branchResumes">[];
  coverLetters: Doc<"coverLetters">[];
  onEditResume: () => void;
  onDuplicateResume: () => void;
  onDeleteResume: () => void;
  onEditBranch: (id: any) => void;
  onDuplicateBranch: (branchId: any) => void;
  onDeleteBranch: (id: any) => void;
  onStatusChange: (id: any, status: string) => void;
  onAddContent: (id: any) => void;
  onEditCoverLetter: (id: any) => void;
  onDeleteCoverLetter: (id: any) => void;
}

export function ResumeCard({
  resume,
  branches,
  coverLetters,
  onEditResume,
  onDuplicateResume,
  onDeleteResume,
  onEditBranch,
  onDuplicateBranch,
  onDeleteBranch,
  onStatusChange,
  onAddContent,
  onEditCoverLetter,
  onDeleteCoverLetter,
}: ResumeCardProps) {
  return (
    <div className="rounded-lg border bg-white">
      {/* Base resume header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="truncate text-sm font-semibold text-zinc-900">{resume.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StatusPill status={resume.status} />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEditResume}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicateResume}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDeleteResume}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Branches */}
      {branches.map((branch) => {
        const branchCLs = coverLetters.filter((cl) => cl.branchResumeId === branch._id);
        return (
          <div key={branch._id} className="border-t">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <span className="truncate text-[13px] font-medium text-zinc-900">{branch.companyName}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusPill status={branch.status} onStatusChange={(s: BranchStatus) => onStatusChange(branch._id, s)} interactive />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddContent(branch._id)} title="Add content">
                  <Plus className="h-3.5 w-3.5 text-blue-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditBranch(branch._id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDeleteBranch(branch._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Cover letters for this branch */}
            {branchCLs.map((cl) => (
              <div key={cl._id} className="flex items-center justify-between border-t bg-gray-50/50 px-3 py-2">
                <div className="flex items-center gap-1.5 pl-5">
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[13px] text-zinc-600">Cover Letter</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditCoverLetter(cl._id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDeleteCoverLetter(cl._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
