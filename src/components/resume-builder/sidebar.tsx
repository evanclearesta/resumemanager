"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorTab } from "./editor-tab";
import { LayoutStyleTab } from "./layout-style-tab";
import type { ResumeContent, LayoutSettings } from "@/lib/types";

interface SidebarProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
  category: string;
  categoryOptions: string[];
  onContentChange: (content: ResumeContent) => void;
  onLayoutChange: (layout: LayoutSettings) => void;
  onCategoryChange: (category: string) => void;
}

export function Sidebar({ content, layoutSettings, category, categoryOptions, onContentChange, onLayoutChange, onCategoryChange }: SidebarProps) {
  return (
    <div className="flex w-[400px] flex-col border-r bg-white">
      <Tabs defaultValue="editor" className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="layout">Layout & Style</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 overflow-y-auto">
          <EditorTab content={content} category={category} onChange={onContentChange} onCategoryChange={onCategoryChange} categoryOptions={categoryOptions} />
        </TabsContent>
        <TabsContent value="layout" className="flex-1 overflow-y-auto">
          <LayoutStyleTab layout={layoutSettings} onChange={onLayoutChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
