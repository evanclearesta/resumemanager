"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, FileText } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

interface CoverLetterEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverLetterId: Id<"coverLetters"> | null;
}

export function CoverLetterEditorModal({
  open,
  onOpenChange,
  coverLetterId,
}: CoverLetterEditorModalProps) {
  const coverLetter = useQuery(
    api.coverLetters.get,
    coverLetterId ? { id: coverLetterId } : "skip"
  );

  const updateCoverLetter = useMutation(api.coverLetters.update);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    onUpdate: ({ editor }) => {
      if (!coverLetterId) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateCoverLetter({
          id: coverLetterId,
          content: JSON.stringify(editor.getJSON()),
        });
      }, 500);
    },
  });

  useEffect(() => {
    if (coverLetter && editor) {
      try {
        const content = JSON.parse(coverLetter.content);
        editor.commands.setContent(content);
      } catch {
        editor.commands.setContent("");
      }
    }
  }, [coverLetter, editor]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Cover Letter</DialogTitle>
          <p className="text-sm text-gray-500">
            {coverLetter?.targetCompany ?? ""} &middot; Auto-saves
          </p>
        </DialogHeader>

        {editor && (
          <div className="flex items-center gap-1 border-b pb-2">
            <Button variant={editor.isActive("bold") ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant={editor.isActive("italic") ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant={editor.isActive("underline") ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button variant={editor.isActive("bulletList") ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={editor.isActive("orderedList") ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="min-h-[400px] rounded-md border p-4">
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>
            <FileText className="mr-2 h-4 w-4" />
            Save Cover Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
