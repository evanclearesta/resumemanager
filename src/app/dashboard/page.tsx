"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FilePlus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TopBar } from "@/components/top-bar";
import { ResumeTable } from "@/components/dashboard/resume-table";
import { CopyBaseResumeModal } from "@/components/dashboard/copy-base-resume-modal";

export default function DashboardPage() {
  const router = useRouter();
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar
        rightActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Base Resume
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/resume/new")}>
                <FilePlus className="mr-2 h-4 w-4" />
                From Scratch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCopyModalOpen(true)}>
                <Copy className="mr-2 h-4 w-4" />
                From Existing Base
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <ResumeTable />
      <CopyBaseResumeModal open={copyModalOpen} onOpenChange={setCopyModalOpen} />
    </div>
  );
}
