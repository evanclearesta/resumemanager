"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch } from "lucide-react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface BranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseResumeId: Id<"baseResumes"> | null;
  baseResumes: Doc<"baseResumes">[];
}

export function BranchModal({ open, onOpenChange, baseResumeId, baseResumes }: BranchModalProps) {
  const router = useRouter();
  const createBranch = useMutation(api.branchResumes.create);

  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const effectiveBaseId = baseResumeId ?? selectedBaseId;

  async function handleSubmit() {
    if (!effectiveBaseId || !companyName) return;

    const branchId = await createBranch({
      baseResumeId: effectiveBaseId as Id<"baseResumes">,
      companyName,
      roleName,
      jobDescription: jobDescription || undefined,
      jobUrl: jobUrl || undefined,
    });

    setCompanyName("");
    setRoleName("");
    setJobDescription("");
    setJobUrl("");
    onOpenChange(false);

    router.push(`/resume/${branchId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create New Branch
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Parent Resume</Label>
            <Select value={effectiveBaseId as string} onValueChange={(v) => v && setSelectedBaseId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a base resume...">
                  {baseResumes.find((r) => r._id === effectiveBaseId)?.title ?? "Select a base resume..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {baseResumes.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input placeholder="e.g. Google, Meta, Stripe..." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role Name</Label>
            <Input placeholder="e.g. Senior Software Engineer" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea placeholder="Paste the job description to help tailor your resume..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Job URL</Label>
            <Input placeholder="https://careers.example.com/jobs/..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!effectiveBaseId || !companyName}>
            <GitBranch className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
