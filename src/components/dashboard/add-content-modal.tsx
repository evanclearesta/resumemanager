"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchResumeId: Id<"branchResumes"> | null;
  onCoverLetterCreated: (id: Id<"coverLetters">) => void;
}

export function AddContentModal({
  open,
  onOpenChange,
  branchResumeId,
  onCoverLetterCreated,
}: AddContentModalProps) {
  const createCoverLetter = useMutation(api.coverLetters.create);
  const [selected, setSelected] = useState<"cover-letter" | null>(null);

  async function handleCreate() {
    if (!branchResumeId || !selected) return;

    if (selected === "cover-letter") {
      const id = await createCoverLetter({ branchResumeId });
      onOpenChange(false);
      setSelected(null);
      onCoverLetterCreated(id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <p className="text-sm text-gray-500">Choose content to add to this branch.</p>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
              selected === "cover-letter" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelected("cover-letter")}
          >
            <FileText className="mt-0.5 h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold">Cover Letter</p>
              <p className="text-xs text-gray-500">
                Write a tailored cover letter for this application. Use the rich text editor to format and customize your letter.
              </p>
            </div>
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!selected}>
            <FileText className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
