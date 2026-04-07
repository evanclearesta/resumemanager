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
    <tr className="border-b hover:bg-gray-50">
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{resume.title}</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            Base
          </span>
        </div>
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">—</td>
      <td className="px-2 py-3">
        <StatusPill status={resume.status} />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(resume.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
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
