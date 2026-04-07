"use client";

import { Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface CoverLetterRowProps {
  coverLetter: Doc<"coverLetters">;
  onEdit: () => void;
  onDelete: () => void;
}

export function CoverLetterRow({ coverLetter, onEdit, onDelete }: CoverLetterRowProps) {
  return (
    <tr className="h-12 border-b border-zinc-200 bg-[#FAFBFC] hover:bg-gray-100/60">
      <td className="py-2.5 pl-12 pr-5">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="text-[13px] text-zinc-600">Cover Letter</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
            Letter
          </span>
        </div>
      </td>
      <td className="hidden px-5 py-2.5 text-[13px] text-zinc-400 lg:table-cell">—</td>
      <td className="px-5 py-2.5">
        <StatusPill status={coverLetter.status} />
      </td>
      <td className="hidden px-5 py-2.5 text-[13px] text-zinc-500 lg:table-cell">{timeAgo(coverLetter.lastEditedAt)}</td>
      <td className="px-5 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
