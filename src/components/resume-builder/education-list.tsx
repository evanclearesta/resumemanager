"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/utils";
import type { EducationEntry } from "@/lib/types";

interface EducationListProps {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}

export function EducationList({ education, onChange }: EducationListProps) {
  function addEntry() {
    onChange([...education, { id: generateId(), institution: "", degree: "", country: "", graduationDate: "" }]);
  }

  function updateEntry(index: number, updates: Partial<EducationEntry>) {
    const updated = [...education];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(education.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4 py-3">
      {education.map((entry, index) => (
        <div key={entry.id} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Education {index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeEntry(index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Institution</Label>
              <Input value={entry.institution} onChange={(e) => updateEntry(index, { institution: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={entry.country ?? ""} onChange={(e) => updateEntry(index, { country: e.target.value })} placeholder="e.g. United States" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Degree</Label>
            <Input value={entry.degree} onChange={(e) => updateEntry(index, { degree: e.target.value })} placeholder="B.S. Computer Science" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Graduation Date</Label>
            <Input type="month" value={entry.graduationDate} onChange={(e) => updateEntry(index, { graduationDate: e.target.value })} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addEntry}>
        <Plus className="mr-2 h-3 w-3" />
        Add Education
      </Button>
    </div>
  );
}
