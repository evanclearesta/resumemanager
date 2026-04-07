"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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
        className="cursor-pointer bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td colSpan={5} className="px-2 py-2.5">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm font-bold">{name}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {count} resumes
            </span>
          </div>
        </td>
      </tr>
      {isOpen && children}
    </>
  );
}
