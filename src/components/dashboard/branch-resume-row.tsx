"use client";

import { Pencil, Copy, Trash2, GitBranch, Plus } from "lucide-react";
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
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 pl-10 pr-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{(branch.content as any)?.contact?.firstName} {(branch.content as any)?.contact?.lastName} - {(branch.content as any)?.targetJobTitle} - {branch.companyName}</span>
        </div>
      </td>
      <td className="px-2 py-3">
        <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">
          {branch.companyName}
        </span>
      </td>
      <td className="px-2 py-3">
        <StatusPill status={branch.status} onStatusChange={onStatusChange} interactive />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(branch.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddContent} title="Add content">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
