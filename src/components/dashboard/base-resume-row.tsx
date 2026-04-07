"use client";

import { Pencil, Copy, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface BaseResumeRowProps {
  resume: Doc<"baseResumes">;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function BaseResumeRow({ resume, onEdit, onDuplicate, onDelete }: BaseResumeRowProps) {
  return (
    <tr className="h-[52px] border-b border-zinc-200 bg-white hover:bg-gray-50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="truncate text-[13px] font-semibold text-zinc-900">{resume.title}</span>
          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
            Base
          </span>
        </div>
      </td>
      <td className="hidden px-5 py-3 text-[13px] text-zinc-400 lg:table-cell">—</td>
      <td className="px-5 py-3">
        <StatusPill status={resume.status} />
      </td>
      <td className="hidden px-5 py-3 text-[13px] text-zinc-500 lg:table-cell">{timeAgo(resume.lastEditedAt)}</td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
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
