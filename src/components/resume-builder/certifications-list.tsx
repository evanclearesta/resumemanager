"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/utils";
import type { CertificationEntry } from "@/lib/types";

interface CertificationsListProps {
  certifications: CertificationEntry[];
  onChange: (certifications: CertificationEntry[]) => void;
}

export function CertificationsList({ certifications, onChange }: CertificationsListProps) {
  function addEntry() { onChange([...certifications, { id: generateId(), name: "", issuer: "", date: "" }]); }
  function updateEntry(index: number, updates: Partial<CertificationEntry>) {
    const updated = [...certifications];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }
  function removeEntry(index: number) { onChange(certifications.filter((_, i) => i !== index)); }

  return (
    <div className="space-y-4 py-3">
      {certifications.map((entry, index) => (
        <div key={entry.id} className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Certification {index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeEntry(index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={entry.name} onChange={(e) => updateEntry(index, { name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Issuer</Label>
              <Input value={entry.issuer} onChange={(e) => updateEntry(index, { issuer: e.target.value })} placeholder="Certification Issuer" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="month" value={entry.date} onChange={(e) => updateEntry(index, { date: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addEntry}>
        <Plus className="mr-2 h-3 w-3" />Add Certification
      </Button>
    </div>
  );
}
