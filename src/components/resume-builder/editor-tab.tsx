"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "./section-header";
import { ContactFields } from "./contact-fields";
import { ExperienceList } from "./experience-list";
import { EducationList } from "./education-list";
import { SkillsList } from "./skills-list";
import { CertificationsList } from "./certifications-list";
import type { ResumeContent } from "@/lib/types";

interface EditorTabProps {
  content: ResumeContent;
  category: string;
  onChange: (content: ResumeContent) => void;
  onCategoryChange: (category: string) => void;
  categoryOptions: string[];
}

export function EditorTab({ content, category, onChange, onCategoryChange, categoryOptions }: EditorTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contact: true, summary: true, experience: true, education: true, skills: true, certifications: true,
  });

  function toggleSection(key: string) { setOpenSections((prev) => ({ ...prev, [key]: !prev[key] })); }
  function updateContent(updates: Partial<ResumeContent>) { onChange({ ...content, ...updates }); }

  return (
    <div className="space-y-1 p-4">
      <div className="space-y-3 pb-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Target Job Title</Label>
          <Input value={content.targetJobTitle} onChange={(e) => updateContent({ targetJobTitle: e.target.value })} placeholder="e.g. Senior Software Engineer" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Resume Tag</Label>
          <Input value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="e.g. Software Engineering" list="category-suggestions" />
          <datalist id="category-suggestions">
            {categoryOptions.map((cat) => (<option key={cat} value={cat} />))}
          </datalist>
        </div>
      </div>

      <SectionHeader title="Contact Details" isOpen={openSections.contact} onToggle={() => toggleSection("contact")} />
      {openSections.contact && <ContactFields contact={content.contact} onChange={(contact) => updateContent({ contact })} />}

      <SectionHeader title="Summary" isOpen={openSections.summary} onToggle={() => toggleSection("summary")} />
      {openSections.summary && (
        <div className="py-3">
          <Label className="text-xs">Professional Summary</Label>
          <Textarea value={content.summary} onChange={(e) => updateContent({ summary: e.target.value })} placeholder="Experienced software engineer with 5+ years..." rows={5} className="mt-1.5" />
        </div>
      )}

      <SectionHeader title="Work Experience" isOpen={openSections.experience} onToggle={() => toggleSection("experience")} />
      {openSections.experience && <ExperienceList experience={content.experience} onChange={(experience) => updateContent({ experience })} />}

      <SectionHeader title="Skills" isOpen={openSections.skills} onToggle={() => toggleSection("skills")} />
      {openSections.skills && <SkillsList skills={content.skills} onChange={(skills) => updateContent({ skills })} />}

      <SectionHeader title="Education" isOpen={openSections.education} onToggle={() => toggleSection("education")} />
      {openSections.education && <EducationList education={content.education} onChange={(education) => updateContent({ education })} />}

      <SectionHeader title="Certifications" isOpen={openSections.certifications} onToggle={() => toggleSection("certifications")} />
      {openSections.certifications && <CertificationsList certifications={content.certifications} onChange={(certifications) => updateContent({ certifications })} />}
    </div>
  );
}
