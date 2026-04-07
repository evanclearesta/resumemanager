"use client";

import { BRANCH_STATUS_OPTIONS, type BranchStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusPillProps {
  status: string;
  onStatusChange?: (status: BranchStatus) => void;
  interactive?: boolean;
}

export function StatusPill({ status, onStatusChange, interactive = false }: StatusPillProps) {
  const option = BRANCH_STATUS_OPTIONS.find((o) => o.value === status) ?? {
    label: status,
    color: "bg-gray-100 text-gray-600",
  };

  const pill = (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${option.color} ${interactive ? "cursor-pointer" : ""}`}
    >
      {option.label}
    </span>
  );

  if (!interactive || !onStatusChange) return pill;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{pill}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {BRANCH_STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(opt.value)}>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${opt.color.split(" ")[0]}`} />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
