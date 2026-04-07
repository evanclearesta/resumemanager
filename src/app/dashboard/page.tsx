"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { ResumeTable } from "@/components/dashboard/resume-table";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar
        rightActions={
          <Button onClick={() => router.push("/resume/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Base Resume
          </Button>
        }
      />
      <ResumeTable />
    </div>
  );
}
