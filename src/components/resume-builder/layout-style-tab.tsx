"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "./section-header";
import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import type { LayoutSettings } from "@/lib/types";

interface LayoutStyleTabProps {
  layout: LayoutSettings;
  onChange: (layout: LayoutSettings) => void;
}

const FONT_OPTIONS = ["Inter", "Georgia", "Times New Roman", "Arial", "Helvetica", "Roboto", "Lato", "Open Sans", "Merriweather"];

const DATE_FORMAT_OPTIONS: { value: LayoutSettings["dateFormat"]; label: string; example: string }[] = [
  { value: "short-month-year", label: "Short Month & Year", example: "e.g. Jan 2024" },
  { value: "full-month-year", label: "Full Month & Year", example: "e.g. January 2024" },
  { value: "short-month-name-year", label: "Short Month Name & Year", example: "e.g. Jan. 2024" },
  { value: "month-number-year", label: "Month Number & Year", example: "e.g. 01/2024" },
];

export function LayoutStyleTab({ layout, onChange }: LayoutStyleTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fonts: true, typography: true, dateFormat: true, page: true,
  });

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateFonts(field: keyof LayoutSettings["fonts"], value: string) {
    onChange({ ...layout, fonts: { ...layout.fonts, [field]: value } });
  }

  function updateTypography(updates: Partial<LayoutSettings["typography"]>) {
    onChange({ ...layout, typography: { ...layout.typography, ...updates } });
  }

  function updateTextStyle(field: keyof LayoutSettings["typography"]["textStyle"]) {
    onChange({
      ...layout,
      typography: {
        ...layout.typography,
        textStyle: { ...layout.typography.textStyle, [field]: !layout.typography.textStyle[field] },
      },
    });
  }

  function updateMargins(field: keyof LayoutSettings["page"]["margins"], value: number) {
    onChange({
      ...layout,
      page: { ...layout.page, margins: { ...layout.page.margins, [field]: value } },
    });
  }

  return (
    <div className="space-y-1 p-4">
      <SectionHeader title="Font Settings" isOpen={openSections.fonts} onToggle={() => toggleSection("fonts")} />
      {openSections.fonts && (
        <div className="space-y-3 py-3">
          {(["title", "heading", "body"] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs capitalize">{field}</Label>
              <Select value={layout.fonts[field]} onValueChange={(v) => v && updateFonts(field, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <SectionHeader title="Typography" isOpen={openSections.typography} onToggle={() => toggleSection("typography")} />
      {openSections.typography && (
        <div className="space-y-3 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Font Size</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={8} max={16} step={0.5} value={layout.typography.fontSize}
                  onChange={(e) => updateTypography({ fontSize: parseFloat(e.target.value) || 11 })} className="w-20" />
                <span className="text-xs text-gray-500">pt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Line Height</Label>
              <Input type="number" min={1} max={2.5} step={0.1} value={layout.typography.lineHeight}
                onChange={(e) => updateTypography({ lineHeight: parseFloat(e.target.value) || 1.5 })} className="w-20" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Text Style</Label>
            <div className="flex gap-1">
              <Button variant={layout.typography.textStyle.bold ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => updateTextStyle("bold")}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant={layout.typography.textStyle.italic ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => updateTextStyle("italic")}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant={layout.typography.textStyle.underline ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => updateTextStyle("underline")}>
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader title="Date Format" isOpen={openSections.dateFormat} onToggle={() => toggleSection("dateFormat")} />
      {openSections.dateFormat && (
        <div className="space-y-2 py-3">
          {DATE_FORMAT_OPTIONS.map((option) => (
            <label key={option.value}
              className={`flex cursor-pointer items-center rounded-md border p-3 ${layout.dateFormat === option.value ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
              <input type="radio" name="dateFormat" value={option.value} checked={layout.dateFormat === option.value}
                onChange={() => onChange({ ...layout, dateFormat: option.value })} className="mr-3" />
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-gray-500">{option.example}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      <SectionHeader title="Page Settings" isOpen={openSections.page} onToggle={() => toggleSection("page")} />
      {openSections.page && (
        <div className="space-y-3 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Page Size</Label>
            <Select value={layout.page.size}
              onValueChange={(v) => onChange({ ...layout, page: { ...layout.page, size: v as "a4" | "letter" } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="letter">Letter (8.5 x 11 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Margins (mm)</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {(["left", "right", "top", "bottom"] as const).map((side) => (
                <div key={side} className="space-y-1">
                  <Label className="text-xs capitalize text-gray-500">{side}</Label>
                  <Input type="number" min={0} max={50} value={layout.page.margins[side]}
                    onChange={(e) => updateMargins(side, parseInt(e.target.value) || 0)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
