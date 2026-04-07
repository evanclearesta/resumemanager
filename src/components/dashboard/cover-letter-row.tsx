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
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 pl-16 pr-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Cover Letter</span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600">
            Letter
          </span>
        </div>
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">—</td>
      <td className="px-2 py-3">
        <StatusPill status={coverLetter.status} />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(coverLetter.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
