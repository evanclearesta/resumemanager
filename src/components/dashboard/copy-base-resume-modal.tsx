"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface CopyBaseResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopyBaseResumeModal({ open, onOpenChange }: CopyBaseResumeModalProps) {
  const router = useRouter();
  const baseResumes = useQuery(api.baseResumes.list);
  const duplicate = useMutation(api.baseResumes.duplicate);

  const [selectedId, setSelectedId] = useState<string>("");

  async function handleSubmit() {
    if (!selectedId) return;

    const newId = await duplicate({ sourceId: selectedId as Id<"baseResumes"> });
    setSelectedId("");
    onOpenChange(false);
    router.push(`/resume/${newId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy from Existing Base
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a base resume..." />
            </SelectTrigger>
            <SelectContent>
              {baseResumes?.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedId}>
            <Copy className="mr-2 h-4 w-4" />
            Create Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
