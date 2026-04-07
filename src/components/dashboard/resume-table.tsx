"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText } from "lucide-react";
import { BranchModal } from "./branch-modal";
import { AddContentModal } from "./add-content-modal";
import { CoverLetterEditorModal } from "./cover-letter-editor-modal";
import { CategoryGroup } from "./category-group";
import { BaseResumeRow } from "./base-resume-row";
import { BranchResumeRow } from "./branch-resume-row";
import { CoverLetterRow } from "./cover-letter-row";
import type { BranchStatus } from "@/lib/types";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ResumeTable() {
  const router = useRouter();
  const baseResumes = useQuery(api.baseResumes.list);
  const branches = useQuery(api.branchResumes.listAll);
  const coverLetters = useQuery(api.coverLetters.listAll);

  const deleteBase = useMutation(api.baseResumes.remove);
  const deleteBranch = useMutation(api.branchResumes.remove);
  const deleteCoverLetter = useMutation(api.coverLetters.remove);
  const updateBranchStatus = useMutation(api.branchResumes.update);

  const [branchModalBaseId, setBranchModalBaseId] = useState<Id<"baseResumes"> | null>(null);
  const [addContentBranchId, setAddContentBranchId] = useState<Id<"branchResumes"> | null>(null);
  const [editCoverLetterId, setEditCoverLetterId] = useState<Id<"coverLetters"> | null>(null);
  const [deleteAction, setDeleteAction] = useState<{ type: string; id: string; name: string } | null>(null);

  // Loading state
  if (baseResumes === undefined) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Empty state
  if (baseResumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <FileText className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
        <p className="mt-1 text-sm text-gray-500">Create your first base resume to get started.</p>
      </div>
    );
  }

  const branchList = branches ?? [];
  const coverLetterList = coverLetters ?? [];

  // Group base resumes by category
  const categories = new Map<string, Doc<"baseResumes">[]>();
  for (const resume of baseResumes) {
    const cat = resume.category || "Uncategorized";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(resume);
  }

  return (
    <div className="p-8">
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 340 }}>
                Resume Name
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 140 }}>
                Target
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 120 }}>
                Status
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Last Edited
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500" style={{ width: 160 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...categories.entries()].map(([category, resumes]) => (
              <CategoryGroup key={category} name={category} count={resumes.length}>
                {resumes.map((resume) => {
                  const resumeBranches = branchList.filter((b) => b.baseResumeId === resume._id);
                  return (
                    <ResumeWithBranches
                      key={resume._id}
                      resume={resume}
                      branches={resumeBranches}
                      coverLetters={coverLetterList}
                      onEditResume={() => router.push(`/resume/${resume._id}`)}
                      onDuplicateResume={() => setBranchModalBaseId(resume._id)}
                      onDeleteResume={() => setDeleteAction({ type: "base resume", id: resume._id, name: resume.title })}
                      onEditBranch={(id: Id<"branchResumes">) => router.push(`/resume/${id}`)}
                      onDuplicateBranch={(baseId: Id<"baseResumes">) => setBranchModalBaseId(baseId)}
                      onDeleteBranch={(id) => setDeleteAction({ type: "branch", id, name: "this branch" })}
                      onStatusChange={(id: Id<"branchResumes">, status: string) => updateBranchStatus({ id, status })}
                      onAddContent={(id: Id<"branchResumes">) => setAddContentBranchId(id)}
                      onEditCoverLetter={(id: Id<"coverLetters">) => setEditCoverLetterId(id)}
                      onDeleteCoverLetter={(id) => setDeleteAction({ type: "cover letter", id, name: "this cover letter" })}
                    />
                  );
                })}
              </CategoryGroup>
            ))}
          </tbody>
        </table>
      </div>

      <BranchModal
        open={branchModalBaseId !== null}
        onOpenChange={(open) => !open && setBranchModalBaseId(null)}
        baseResumeId={branchModalBaseId}
        baseResumes={baseResumes}
      />

      <AddContentModal
        open={addContentBranchId !== null}
        onOpenChange={(open) => !open && setAddContentBranchId(null)}
        branchResumeId={addContentBranchId}
        onCoverLetterCreated={(id) => setEditCoverLetterId(id)}
      />

      <CoverLetterEditorModal
        open={editCoverLetterId !== null}
        onOpenChange={(open) => !open && setEditCoverLetterId(null)}
        coverLetterId={editCoverLetterId}
      />

      <AlertDialog open={deleteAction !== null} onOpenChange={(open) => !open && setDeleteAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteAction?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteAction?.name}&quot;
              {deleteAction?.type === "base resume" && " and all its branches and cover letters"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleteAction) return;
                if (deleteAction.type === "base resume") deleteBase({ id: deleteAction.id as any });
                else if (deleteAction.type === "branch") deleteBranch({ id: deleteAction.id as any });
                else if (deleteAction.type === "cover letter") deleteCoverLetter({ id: deleteAction.id as any });
                setDeleteAction(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResumeWithBranches({
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
}: {
  resume: Doc<"baseResumes">;
  branches: Doc<"branchResumes">[];
  coverLetters: Doc<"coverLetters">[];
  onEditResume: () => void;
  onDuplicateResume: () => void;
  onDeleteResume: () => void;
  onEditBranch: (id: Id<"branchResumes">) => void;
  onDuplicateBranch: (baseId: Id<"baseResumes">) => void;
  onDeleteBranch: (id: Id<"branchResumes">) => void;
  onStatusChange: (id: Id<"branchResumes">, status: string) => void;
  onAddContent: (id: Id<"branchResumes">) => void;
  onEditCoverLetter: (id: Id<"coverLetters">) => void;
  onDeleteCoverLetter: (id: Id<"coverLetters">) => void;
}) {
  return (
    <>
      <BaseResumeRow
        resume={resume}
        onEdit={onEditResume}
        onDuplicate={onDuplicateResume}
        onDelete={onDeleteResume}
      />
      {branches.map((branch) => {
        const branchCoverLetters = coverLetters.filter((cl) => cl.branchResumeId === branch._id);
        return (
          <span key={branch._id}>
            <BranchResumeRow
              branch={branch}
              onEdit={() => onEditBranch(branch._id)}
              onDuplicate={() => onDuplicateBranch(resume._id)}
              onDelete={() => onDeleteBranch(branch._id)}
              onStatusChange={(status: BranchStatus) => onStatusChange(branch._id, status)}
              onAddContent={() => onAddContent(branch._id)}
            />
            {branchCoverLetters.map((cl) => (
              <CoverLetterRow
                key={cl._id}
                coverLetter={cl}
                onEdit={() => onEditCoverLetter(cl._id)}
                onDelete={() => onDeleteCoverLetter(cl._id)}
              />
            ))}
          </span>
        );
      })}
    </>
  );
}
