"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionHeader({ title, isOpen, onToggle }: SectionHeaderProps) {
  return (
    <button className="flex w-full items-center justify-between border-b py-2.5" onClick={onToggle}>
      <span className="text-sm font-semibold">{title}</span>
      <ChevronDown className={cn("h-[18px] w-[18px] text-gray-500 transition-transform", !isOpen && "-rotate-90")} />
    </button>
  );
}
