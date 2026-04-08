"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";

interface CategoryGroupProps {
  name: string;
  count: number;
  children: React.ReactNode;
}

export function CategoryGroup({ name, count, children }: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <tr
        className="h-10 cursor-pointer bg-blue-50/60 hover:bg-blue-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td colSpan={5} className="px-5 py-2">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-blue-600" />
            <span className="text-[13px] font-semibold text-zinc-900">{name}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              {count} branches
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            )}
          </div>
        </td>
      </tr>
      {isOpen && children}
    </>
  );
}
