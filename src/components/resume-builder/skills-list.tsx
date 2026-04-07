"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SkillCategory } from "@/lib/types";

interface SkillsListProps {
  skills: SkillCategory[];
  onChange: (skills: SkillCategory[]) => void;
}

export function SkillsList({ skills, onChange }: SkillsListProps) {
  function addCategory() { onChange([...skills, { category: "", items: [] }]); }
  function updateCategory(index: number, category: string) {
    const updated = [...skills];
    updated[index] = { ...updated[index], category };
    onChange(updated);
  }
  function removeCategory(index: number) { onChange(skills.filter((_, i) => i !== index)); }
  function addSkill(catIndex: number, skill: string) {
    if (!skill.trim()) return;
    const updated = [...skills];
    updated[catIndex] = { ...updated[catIndex], items: [...updated[catIndex].items, skill.trim()] };
    onChange(updated);
  }
  function removeSkill(catIndex: number, skillIndex: number) {
    const updated = [...skills];
    updated[catIndex] = { ...updated[catIndex], items: updated[catIndex].items.filter((_, i) => i !== skillIndex) };
    onChange(updated);
  }

  return (
    <div className="space-y-4 py-3">
      {skills.map((category, catIndex) => (
        <SkillCategoryEditor key={catIndex} category={category} index={catIndex}
          onUpdateCategory={(cat) => updateCategory(catIndex, cat)}
          onRemoveCategory={() => removeCategory(catIndex)}
          onAddSkill={(skill) => addSkill(catIndex, skill)}
          onRemoveSkill={(skillIndex) => removeSkill(catIndex, skillIndex)}
        />
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addCategory}>
        <Plus className="mr-2 h-3 w-3" />Add Category
      </Button>
    </div>
  );
}

function SkillCategoryEditor({ category, index, onUpdateCategory, onRemoveCategory, onAddSkill, onRemoveSkill }: {
  category: SkillCategory; index: number;
  onUpdateCategory: (cat: string) => void; onRemoveCategory: () => void;
  onAddSkill: (skill: string) => void; onRemoveSkill: (skillIndex: number) => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Category {index + 1}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={onRemoveCategory}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Category Name</Label>
        <Input value={category.category} onChange={(e) => onUpdateCategory(e.target.value)} placeholder="e.g. Programming Languages" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {category.items.map((skill, skillIndex) => (
          <span key={skillIndex} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            {skill}
            <button onClick={() => onRemoveSkill(skillIndex)}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill..." className="text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddSkill(newSkill); setNewSkill(""); } }}
        />
        <Button variant="outline" size="sm" onClick={() => { onAddSkill(newSkill); setNewSkill(""); }}>Add</Button>
      </div>
    </div>
  );
}
