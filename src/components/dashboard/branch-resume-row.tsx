"use client";

import { Pencil, Copy, Trash2, GitBranch, Plus, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { BranchStatus } from "@/lib/types";

interface BranchResumeRowProps {
  branch: Doc<"branchResumes">;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStatusChange: (status: BranchStatus) => void;
  onAddContent: () => void;
}

export function BranchResumeRow({
  branch,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onAddContent,
}: BranchResumeRowProps) {
  return (
    <tr className="h-12 border-b border-zinc-200 bg-[#FAFBFC] hover:bg-gray-100/60">
      <td className="py-2.5 pl-8 pr-5">
        <div className="flex items-center gap-2">
          <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="truncate text-[13px] font-medium text-zinc-900">{(branch.content as any)?.contact?.firstName} {(branch.content as any)?.contact?.lastName} - {(branch.content as any)?.targetJobTitle} - {branch.companyName}</span>
        </div>
      </td>
      <td className="hidden px-5 py-2.5 lg:table-cell">
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
          {branch.companyName}
        </span>
      </td>
      <td className="px-5 py-2.5">
        <StatusPill status={branch.status} onStatusChange={onStatusChange} interactive />
      </td>
      <td className="hidden px-5 py-2.5 text-[13px] text-zinc-500 lg:table-cell">{timeAgo(branch.lastEditedAt)}</td>
      <td className="px-5 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddContent} title="Add content">
            <Plus className="h-3.5 w-3.5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
