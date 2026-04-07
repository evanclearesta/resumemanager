"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/utils";
import type { ExperienceEntry } from "@/lib/types";

interface ExperienceListProps {
  experience: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}

export function ExperienceList({ experience, onChange }: ExperienceListProps) {
  function addEntry() {
    onChange([...experience, { id: generateId(), company: "", title: "", startDate: "", endDate: "", current: false, description: "" }]);
  }

  function updateEntry(index: number, updates: Partial<ExperienceEntry>) {
    const updated = [...experience];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(experience.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4 py-3">
      {experience.map((entry, index) => (
        <div key={entry.id} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Experience {index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeEntry(index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={entry.company} onChange={(e) => updateEntry(index, { company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Job Title</Label>
              <Input value={entry.title} onChange={(e) => updateEntry(index, { title: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input type="month" value={entry.startDate} onChange={(e) => updateEntry(index, { startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input type="month" value={entry.endDate} onChange={(e) => updateEntry(index, { endDate: e.target.value })} disabled={entry.current} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry(index, { current: e.target.checked, endDate: "" })} className="h-3.5 w-3.5" />
            <Label className="text-xs">Currently working here</Label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description/Achievements</Label>
            <Textarea value={entry.description} onChange={(e) => updateEntry(index, { description: e.target.value })} placeholder="- Led a team of 5 engineers..." rows={4} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addEntry}>
        <Plus className="mr-2 h-3 w-3" />
        Add Experience
      </Button>
    </div>
  );
}
