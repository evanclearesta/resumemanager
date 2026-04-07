# Resume Builder & Management App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based resume builder with base/branch resume management, live PDF preview, cover letter editing, and ATS-friendly PDF export.

**Architecture:** Next.js App Router with Clerk auth and Convex backend. Split into two main pages — a dashboard (table view with CRUD) and a resume builder (split-pane editor + live @react-pdf/renderer preview). Cover letters use Tiptap rich text editor in a modal.

**Tech Stack:** Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, Clerk, Convex, @react-pdf/renderer, Tiptap

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout: ClerkProvider + ConvexProviderWithClerk
│   ├── globals.css                         # Tailwind + global styles
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/page.tsx # Clerk sign-up
│   ├── dashboard/
│   │   ├── page.tsx                        # Dashboard page (table view)
│   │   └── layout.tsx                      # Dashboard layout (auth guard)
│   └── resume/
│       ├── [id]/page.tsx                   # Resume builder page
│       └── layout.tsx                      # Resume layout (auth guard)
├── components/
│   ├── ui/                                 # shadcn/ui components (auto-generated)
│   ├── providers.tsx                       # ClerkProvider + ConvexProviderWithClerk wrapper
│   ├── top-bar.tsx                         # Shared top bar (logo + right actions slot)
│   ├── dashboard/
│   │   ├── resume-table.tsx                # Full table with category grouping
│   │   ├── category-group.tsx              # Collapsible category section
│   │   ├── base-resume-row.tsx             # Base resume table row
│   │   ├── branch-resume-row.tsx           # Branch resume table row (indented)
│   │   ├── cover-letter-row.tsx            # Cover letter table row
│   │   ├── status-pill.tsx                 # Color-coded status badge
│   │   ├── branch-modal.tsx                # Create branch dialog
│   │   ├── add-content-modal.tsx           # Add content type dialog
│   │   └── cover-letter-editor-modal.tsx   # Tiptap cover letter editor dialog
│   └── resume-builder/
│       ├── resume-builder.tsx              # Main split-pane container
│       ├── sidebar.tsx                     # Sidebar with tab switching
│       ├── editor-tab.tsx                  # Editor tab: all form sections
│       ├── section-header.tsx              # Collapsible section header
│       ├── contact-fields.tsx              # Contact details form
│       ├── experience-list.tsx             # Work experience section (add/remove/reorder)
│       ├── education-list.tsx              # Education section
│       ├── skills-list.tsx                 # Skills section with tags
│       ├── certifications-list.tsx         # Certifications section
│       ├── layout-style-tab.tsx            # Layout & Style tab: fonts, typography, page settings
│       ├── preview-area.tsx                # PDF preview wrapper
│       └── resume-pdf-document.tsx         # @react-pdf/renderer Document component
├── lib/
│   ├── types.ts                            # ResumeContent, LayoutSettings, status types
│   ├── defaults.ts                         # Default content + layout values
│   └── utils.ts                            # Shared utilities (cn, date formatting)
convex/
├── schema.ts                               # Convex schema (users, baseResumes, branchResumes, coverLetters)
├── users.ts                                # User sync mutations (Clerk webhook)
├── baseResumes.ts                          # Base resume CRUD queries/mutations
├── branchResumes.ts                        # Branch resume CRUD + deep copy mutation
├── coverLetters.ts                         # Cover letter CRUD queries/mutations
└── http.ts                                 # HTTP routes for Clerk webhook
```

---

## Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /c/Users/Administrator/Documents/Project/Claude/ResumeApp
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full Next.js scaffolding.

- [ ] **Step 2: Install core dependencies**

```bash
npm install convex @clerk/nextjs @clerk/clerk-react @react-pdf/renderer @tiptap/react @tiptap/starter-kit @tiptap/extension-underline lucide-react
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Then install needed components:

```bash
npx shadcn@latest add button dialog input label select tabs table badge textarea dropdown-menu tooltip separator
```

- [ ] **Step 4: Initialize Convex**

```bash
npx convex dev --once
```

This creates the `convex/` directory with `_generated/` types. You'll need to log in to Convex if not already authenticated. Follow the prompts to create a new project called "resume-builder".

- [ ] **Step 5: Create environment file**

Create `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=<your convex deployment URL from step 4>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from Clerk dashboard>
CLERK_SECRET_KEY=<from Clerk dashboard>
CLERK_WEBHOOK_SECRET=<from Clerk webhook setup>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

- [ ] **Step 6: Verify the dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server running at `http://localhost:3000` with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with Convex, Clerk, shadcn/ui, react-pdf, tiptap"
```

---

## Task 2: Shared Types & Defaults

**Files:**
- Create: `src/lib/types.ts`, `src/lib/defaults.ts`, `src/lib/utils.ts`

- [ ] **Step 1: Create shared types**

Create `src/lib/types.ts`:

```typescript
export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  graduationDate: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeContent {
  targetJobTitle: string;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
}

export interface LayoutSettings {
  fonts: {
    title: string;
    heading: string;
    body: string;
  };
  typography: {
    fontSize: number;
    lineHeight: number;
    textStyle: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
    };
  };
  dateFormat: "short-month-year" | "full-month-year" | "short-month-name-year" | "month-number-year";
  page: {
    size: "a4" | "letter";
    margins: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
}

export type BranchStatus = "draft" | "submitted" | "interview" | "offered" | "rejected";
export type CoverLetterStatus = "draft" | "sent";

export const BRANCH_STATUS_OPTIONS: { value: BranchStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-600" },
  { value: "interview", label: "Interview", color: "bg-orange-100 text-orange-600" },
  { value: "offered", label: "Offered", color: "bg-green-100 text-green-600" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-600" },
];
```

- [ ] **Step 2: Create defaults**

Create `src/lib/defaults.ts`:

```typescript
import type { ResumeContent, LayoutSettings } from "./types";

export const DEFAULT_CONTENT: ResumeContent = {
  targetJobTitle: "",
  contact: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
};

export const DEFAULT_LAYOUT: LayoutSettings = {
  fonts: {
    title: "Inter",
    heading: "Inter",
    body: "Inter",
  },
  typography: {
    fontSize: 11,
    lineHeight: 1.5,
    textStyle: {
      bold: false,
      italic: false,
      underline: false,
    },
  },
  dateFormat: "short-month-year",
  page: {
    size: "a4",
    margins: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 20,
    },
  },
};
```

- [ ] **Step 3: Create utils**

Create `src/lib/utils.ts` (shadcn likely already created this, extend it):

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, format: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const month = date.getMonth();
  const year = date.getFullYear();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  switch (format) {
    case "short-month-year": return `${shortMonthNames[month]} ${year}`;
    case "full-month-year": return `${monthNames[month]} ${year}`;
    case "short-month-name-year": return `${shortMonthNames[month]}. ${year}`;
    case "month-number-year": return `${String(month + 1).padStart(2, "0")}/${year}`;
    default: return `${shortMonthNames[month]} ${year}`;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add shared types, defaults, and utility functions"
```

---

## Task 3: Convex Schema & Backend Functions

**Files:**
- Create: `convex/schema.ts`, `convex/users.ts`, `convex/baseResumes.ts`, `convex/branchResumes.ts`, `convex/coverLetters.ts`, `convex/http.ts`

- [ ] **Step 1: Define Convex schema**

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  baseResumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    category: v.string(),
    content: v.any(),
    layoutSettings: v.any(),
    status: v.string(),
    lastEditedAt: v.number(),
  }).index("by_user", ["userId"]),

  branchResumes: defineTable({
    userId: v.id("users"),
    baseResumeId: v.id("baseResumes"),
    companyName: v.string(),
    roleName: v.string(),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    content: v.any(),
    layoutSettings: v.any(),
    status: v.string(),
    lastEditedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_base_resume", ["baseResumeId"]),

  coverLetters: defineTable({
    userId: v.id("users"),
    branchResumeId: v.id("branchResumes"),
    content: v.string(),
    targetCompany: v.string(),
    status: v.string(),
    lastEditedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_branch_resume", ["branchResumeId"]),
});
```

- [ ] **Step 2: Create user sync functions**

Create `convex/users.ts`:

```typescript
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", args);
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
```

- [ ] **Step 3: Create Clerk webhook HTTP route**

Create `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();
    const wh = new Webhook(webhookSecret);

    let event: any;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const { type, data } = event;

    if (type === "user.created" || type === "user.updated") {
      await ctx.runMutation(internal.users.upsertUser, {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        imageUrl: data.image_url ?? "",
      });
    }

    if (type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteUser, {
        clerkId: data.id,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

- [ ] **Step 4: Install svix for webhook verification**

```bash
npm install svix
```

- [ ] **Step 5: Create base resume CRUD functions**

Create `convex/baseResumes.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("baseResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("baseResumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    content: v.any(),
    layoutSettings: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("baseResumes", {
      userId: user._id,
      title: args.title,
      category: args.category,
      content: args.content,
      layoutSettings: args.layoutSettings,
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("baseResumes"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    content: v.optional(v.any()),
    layoutSettings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.category !== undefined) updates.category = fields.category;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.layoutSettings !== undefined) updates.layoutSettings = fields.layoutSettings;

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("baseResumes") },
  handler: async (ctx, args) => {
    // Cascade delete: remove all branches and their cover letters
    const branches = await ctx.db
      .query("branchResumes")
      .withIndex("by_base_resume", (q) => q.eq("baseResumeId", args.id))
      .collect();

    for (const branch of branches) {
      const coverLetters = await ctx.db
        .query("coverLetters")
        .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", branch._id))
        .collect();
      for (const cl of coverLetters) {
        await ctx.db.delete(cl._id);
      }
      await ctx.db.delete(branch._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listCategories = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const resumes = await ctx.db
      .query("baseResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const categories = [...new Set(resumes.map((r) => r.category).filter(Boolean))];
    return categories;
  },
});
```

- [ ] **Step 6: Create branch resume CRUD functions**

Create `convex/branchResumes.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByBase = query({
  args: { baseResumeId: v.id("baseResumes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchResumes")
      .withIndex("by_base_resume", (q) => q.eq("baseResumeId", args.baseResumeId))
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("branchResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("branchResumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    baseResumeId: v.id("baseResumes"),
    companyName: v.string(),
    roleName: v.string(),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const baseResume = await ctx.db.get(args.baseResumeId);
    if (!baseResume) throw new Error("Base resume not found");

    // Deep copy content and layout from base
    return await ctx.db.insert("branchResumes", {
      userId: user._id,
      baseResumeId: args.baseResumeId,
      companyName: args.companyName,
      roleName: args.roleName,
      jobDescription: args.jobDescription,
      jobUrl: args.jobUrl,
      content: JSON.parse(JSON.stringify(baseResume.content)),
      layoutSettings: JSON.parse(JSON.stringify(baseResume.layoutSettings)),
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("branchResumes"),
    companyName: v.optional(v.string()),
    roleName: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    content: v.optional(v.any()),
    layoutSettings: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("branchResumes") },
  handler: async (ctx, args) => {
    // Cascade delete cover letters
    const coverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.id))
      .collect();
    for (const cl of coverLetters) {
      await ctx.db.delete(cl._id);
    }
    await ctx.db.delete(args.id);
  },
});
```

- [ ] **Step 7: Create cover letter CRUD functions**

Create `convex/coverLetters.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByBranch = query({
  args: { branchResumeId: v.id("branchResumes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.branchResumeId))
      .first();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("coverLetters")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    branchResumeId: v.id("branchResumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const branch = await ctx.db.get(args.branchResumeId);
    if (!branch) throw new Error("Branch resume not found");

    // Check if cover letter already exists for this branch
    const existing = await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.branchResumeId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("coverLetters", {
      userId: user._id,
      branchResumeId: args.branchResumeId,
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
      targetCompany: branch.companyName,
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("coverLetters"),
    content: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

- [ ] **Step 8: Run Convex dev to verify schema compiles**

```bash
npx convex dev --once
```

Expected: Schema and functions compile without errors.

- [ ] **Step 9: Commit**

```bash
git add convex/ src/lib/
git commit -m "feat: add Convex schema, CRUD functions for resumes/branches/cover letters, Clerk webhook"
```

---

## Task 4: Auth Setup (Clerk + Convex Providers)

**Files:**
- Create: `src/components/providers.tsx`, `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`, `src/middleware.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create providers wrapper**

Create `src/components/providers.tsx`:

```typescript
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeBuilder",
  description: "Build and manage your resumes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create auth pages**

Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

- [ ] **Step 4: Create middleware for auth protection**

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/resume(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 5: Create root page redirect**

Replace `src/app/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 6: Verify auth flow works**

Run `npm run dev` and `npx convex dev` (in separate terminals). Navigate to `http://localhost:3000`. You should be redirected to `/sign-in`. After signing in, you should be redirected to `/dashboard` (which will be a blank page for now).

- [ ] **Step 7: Commit**

```bash
git add src/ convex/
git commit -m "feat: add Clerk + Convex auth setup with protected routes"
```

---

## Task 5: Dashboard — Table View

**Files:**
- Create: `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/components/top-bar.tsx`, `src/components/dashboard/resume-table.tsx`, `src/components/dashboard/category-group.tsx`, `src/components/dashboard/base-resume-row.tsx`, `src/components/dashboard/branch-resume-row.tsx`, `src/components/dashboard/cover-letter-row.tsx`, `src/components/dashboard/status-pill.tsx`

- [ ] **Step 1: Create the TopBar component**

Create `src/components/top-bar.tsx`:

```typescript
import { FileText } from "lucide-react";

interface TopBarProps {
  rightActions?: React.ReactNode;
}

export function TopBar({ rightActions }: TopBarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b bg-white px-8">
      <div className="flex items-center gap-2.5">
        <FileText className="h-[22px] w-[22px] text-blue-500" />
        <span className="text-lg font-bold">ResumeBuilder</span>
      </div>
      {rightActions && <div className="flex items-center gap-3">{rightActions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create the StatusPill component**

Create `src/components/dashboard/status-pill.tsx`:

```typescript
"use client";

import { BRANCH_STATUS_OPTIONS, type BranchStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusPillProps {
  status: string;
  onStatusChange?: (status: BranchStatus) => void;
  interactive?: boolean;
}

export function StatusPill({ status, onStatusChange, interactive = false }: StatusPillProps) {
  const option = BRANCH_STATUS_OPTIONS.find((o) => o.value === status) ?? {
    label: status,
    color: "bg-gray-100 text-gray-600",
  };

  const pill = (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${option.color} ${interactive ? "cursor-pointer" : ""}`}
    >
      {option.label}
    </span>
  );

  if (!interactive || !onStatusChange) return pill;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{pill}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {BRANCH_STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(opt.value)}>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${opt.color.split(" ")[0]}`} />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 3: Create BaseResumeRow component**

Create `src/components/dashboard/base-resume-row.tsx`:

```typescript
"use client";

import { Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface BaseResumeRowProps {
  resume: Doc<"baseResumes">;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function BaseResumeRow({ resume, onEdit, onDuplicate, onDelete }: BaseResumeRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{resume.title}</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            Base
          </span>
        </div>
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">—</td>
      <td className="px-2 py-3">
        <StatusPill status={resume.status} />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(resume.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
}
```

- [ ] **Step 4: Create BranchResumeRow component**

Create `src/components/dashboard/branch-resume-row.tsx`:

```typescript
"use client";

import { Pencil, Copy, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { BranchStatus } from "@/lib/types";

interface BranchResumeRowProps {
  branch: Doc<"branchResumes">;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStatusChange: (status: BranchStatus) => void;
  onAddContent: () => void;
}

export function BranchResumeRow({
  branch,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onAddContent,
}: BranchResumeRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 pl-10 pr-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{branch.content?.contact?.firstName} {branch.content?.contact?.lastName} - {branch.content?.targetJobTitle} - {branch.companyName}</span>
        </div>
      </td>
      <td className="px-2 py-3">
        <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">
          {branch.companyName}
        </span>
      </td>
      <td className="px-2 py-3">
        <StatusPill status={branch.status} onStatusChange={onStatusChange} interactive />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(branch.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
```

- [ ] **Step 5: Create CoverLetterRow component**

Create `src/components/dashboard/cover-letter-row.tsx`:

```typescript
"use client";

import { Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { timeAgo } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface CoverLetterRowProps {
  coverLetter: Doc<"coverLetters">;
  onEdit: () => void;
  onDelete: () => void;
}

export function CoverLetterRow({ coverLetter, onEdit, onDelete }: CoverLetterRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 pl-16 pr-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Cover Letter</span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600">
            Letter
          </span>
        </div>
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">—</td>
      <td className="px-2 py-3">
        <StatusPill status={coverLetter.status} />
      </td>
      <td className="px-2 py-3 text-sm text-gray-500">{timeAgo(coverLetter.lastEditedAt)}</td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
```

- [ ] **Step 6: Create CategoryGroup component**

Create `src/components/dashboard/category-group.tsx`:

```typescript
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
```

- [ ] **Step 7: Create ResumeTable component**

Create `src/components/dashboard/resume-table.tsx`:

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryGroup } from "./category-group";
import { BaseResumeRow } from "./base-resume-row";
import { BranchResumeRow } from "./branch-resume-row";
import { CoverLetterRow } from "./cover-letter-row";
import { BranchModal } from "./branch-modal";
import { AddContentModal } from "./add-content-modal";
import { CoverLetterEditorModal } from "./cover-letter-editor-modal";
import type { BranchStatus } from "@/lib/types";
import type { Id } from "../../../convex/_generated/dataModel";

export function ResumeTable() {
  const router = useRouter();
  const baseResumes = useQuery(api.baseResumes.list) ?? [];
  const branches = useQuery(api.branchResumes.listAll) ?? [];
  const coverLetters = useQuery(api.coverLetters.listAll) ?? [];

  const deleteBase = useMutation(api.baseResumes.remove);
  const deleteBranch = useMutation(api.branchResumes.remove);
  const deleteCoverLetter = useMutation(api.coverLetters.remove);
  const updateBranchStatus = useMutation(api.branchResumes.update);

  const [branchModalBaseId, setBranchModalBaseId] = useState<Id<"baseResumes"> | null>(null);
  const [addContentBranchId, setAddContentBranchId] = useState<Id<"branchResumes"> | null>(null);
  const [editCoverLetterId, setEditCoverLetterId] = useState<Id<"coverLetters"> | null>(null);

  // Group base resumes by category
  const categories = new Map<string, typeof baseResumes>();
  for (const resume of baseResumes) {
    const cat = resume.category || "Uncategorized";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(resume);
  }

  return (
    <div className="p-8">
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 340 }}>
                Resume Name
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 140 }}>
                Target
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500" style={{ width: 120 }}>
                Status
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Last Edited
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500" style={{ width: 160 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...categories.entries()].map(([category, resumes]) => (
              <CategoryGroup key={category} name={category} count={resumes.length}>
                {resumes.map((resume) => {
                  const resumeBranches = branches.filter(
                    (b) => b.baseResumeId === resume._id
                  );
                  return (
                    <ResumeWithBranches
                      key={resume._id}
                      resume={resume}
                      branches={resumeBranches}
                      coverLetters={coverLetters}
                      onEditResume={() => router.push(`/resume/${resume._id}`)}
                      onDuplicateResume={() => setBranchModalBaseId(resume._id)}
                      onDeleteResume={() => deleteBase({ id: resume._id })}
                      onEditBranch={(id) => router.push(`/resume/${id}`)}
                      onDuplicateBranch={(baseId) => setBranchModalBaseId(baseId)}
                      onDeleteBranch={(id) => deleteBranch({ id })}
                      onStatusChange={(id, status) => updateBranchStatus({ id, status })}
                      onAddContent={(id) => setAddContentBranchId(id)}
                      onEditCoverLetter={(id) => setEditCoverLetterId(id)}
                      onDeleteCoverLetter={(id) => deleteCoverLetter({ id })}
                    />
                  );
                })}
              </CategoryGroup>
            ))}
          </tbody>
        </table>
      </div>

      <BranchModal
        open={branchModalBaseId !== null}
        onOpenChange={(open) => !open && setBranchModalBaseId(null)}
        baseResumeId={branchModalBaseId}
        baseResumes={baseResumes}
      />

      <AddContentModal
        open={addContentBranchId !== null}
        onOpenChange={(open) => !open && setAddContentBranchId(null)}
        branchResumeId={addContentBranchId}
        onCoverLetterCreated={(id) => setEditCoverLetterId(id)}
      />

      <CoverLetterEditorModal
        open={editCoverLetterId !== null}
        onOpenChange={(open) => !open && setEditCoverLetterId(null)}
        coverLetterId={editCoverLetterId}
      />
    </div>
  );
}

function ResumeWithBranches({
  resume,
  branches,
  coverLetters,
  onEditResume,
  onDuplicateResume,
  onDeleteResume,
  onEditBranch,
  onDuplicateBranch,
  onDeleteBranch,
  onStatusChange,
  onAddContent,
  onEditCoverLetter,
  onDeleteCoverLetter,
}: any) {
  return (
    <>
      <BaseResumeRow
        resume={resume}
        onEdit={onEditResume}
        onDuplicate={onDuplicateResume}
        onDelete={onDeleteResume}
      />
      {branches.map((branch: any) => {
        const branchCoverLetters = coverLetters.filter(
          (cl: any) => cl.branchResumeId === branch._id
        );
        return (
          <span key={branch._id}>
            <BranchResumeRow
              branch={branch}
              onEdit={() => onEditBranch(branch._id)}
              onDuplicate={() => onDuplicateBranch(resume._id)}
              onDelete={() => onDeleteBranch(branch._id)}
              onStatusChange={(status: BranchStatus) => onStatusChange(branch._id, status)}
              onAddContent={() => onAddContent(branch._id)}
            />
            {branchCoverLetters.map((cl: any) => (
              <CoverLetterRow
                key={cl._id}
                coverLetter={cl}
                onEdit={() => onEditCoverLetter(cl._id)}
                onDelete={() => onDeleteCoverLetter(cl._id)}
              />
            ))}
          </span>
        );
      })}
    </>
  );
}
```

- [ ] **Step 8: Create dashboard page and layout**

Create `src/app/dashboard/layout.tsx`:

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

Create `src/app/dashboard/page.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { ResumeTable } from "@/components/dashboard/resume-table";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar
        rightActions={
          <Button onClick={() => router.push("/resume/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Base Resume
          </Button>
        }
      />
      <ResumeTable />
    </div>
  );
}
```

- [ ] **Step 9: Verify dashboard renders**

Run `npm run dev` and `npx convex dev`. Navigate to `/dashboard`. You should see an empty table with headers and the "New Base Resume" button. No errors in console.

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: add dashboard page with resume table, category groups, status pills"
```

---

## Task 6: Dashboard Modals (Branch, Add Content, Cover Letter Editor)

**Files:**
- Create: `src/components/dashboard/branch-modal.tsx`, `src/components/dashboard/add-content-modal.tsx`, `src/components/dashboard/cover-letter-editor-modal.tsx`

- [ ] **Step 1: Create BranchModal**

Create `src/components/dashboard/branch-modal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch } from "lucide-react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface BranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseResumeId: Id<"baseResumes"> | null;
  baseResumes: Doc<"baseResumes">[];
}

export function BranchModal({ open, onOpenChange, baseResumeId, baseResumes }: BranchModalProps) {
  const router = useRouter();
  const createBranch = useMutation(api.branchResumes.create);

  const [selectedBaseId, setSelectedBaseId] = useState<string>(baseResumeId ?? "");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  // Sync selectedBaseId when baseResumeId prop changes
  const effectiveBaseId = baseResumeId ?? selectedBaseId;

  async function handleSubmit() {
    if (!effectiveBaseId || !companyName) return;

    const branchId = await createBranch({
      baseResumeId: effectiveBaseId as Id<"baseResumes">,
      companyName,
      roleName,
      jobDescription: jobDescription || undefined,
      jobUrl: jobUrl || undefined,
    });

    // Reset form
    setCompanyName("");
    setRoleName("");
    setJobDescription("");
    setJobUrl("");
    onOpenChange(false);

    router.push(`/resume/${branchId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create New Branch
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Parent Resume</Label>
            <Select value={effectiveBaseId as string} onValueChange={setSelectedBaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a base resume..." />
              </SelectTrigger>
              <SelectContent>
                {baseResumes.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              placeholder="e.g. Google, Meta, Stripe..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role Name</Label>
            <Input
              placeholder="e.g. Senior Software Engineer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              placeholder="Paste the job description to help tailor your resume..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Job URL</Label>
            <Input
              placeholder="https://careers.example.com/jobs/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!effectiveBaseId || !companyName}>
            <GitBranch className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create AddContentModal**

Create `src/components/dashboard/add-content-modal.tsx`:

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchResumeId: Id<"branchResumes"> | null;
  onCoverLetterCreated: (id: Id<"coverLetters">) => void;
}

export function AddContentModal({
  open,
  onOpenChange,
  branchResumeId,
  onCoverLetterCreated,
}: AddContentModalProps) {
  const createCoverLetter = useMutation(api.coverLetters.create);
  const [selected, setSelected] = useState<"cover-letter" | null>(null);

  async function handleCreate() {
    if (!branchResumeId || !selected) return;

    if (selected === "cover-letter") {
      const id = await createCoverLetter({ branchResumeId });
      onOpenChange(false);
      setSelected(null);
      onCoverLetterCreated(id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <p className="text-sm text-gray-500">Choose content to add to this branch.</p>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
              selected === "cover-letter" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelected("cover-letter")}
          >
            <FileText className="mt-0.5 h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold">Cover Letter</p>
              <p className="text-xs text-gray-500">
                Write a tailored cover letter for this application. Use the rich text editor to
                format and customize your letter.
              </p>
            </div>
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!selected}>
            <FileText className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create CoverLetterEditorModal**

Create `src/components/dashboard/cover-letter-editor-modal.tsx`:

```typescript
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
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from "lucide-react";
import { useEffect, useCallback, useRef } from "react";
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
    api.coverLetters.getByBranch,
    // We need a different query — let's use a direct get. We'll address this below.
    coverLetterId ? undefined : "skip"
  );

  // For simplicity, we'll load the cover letter data via a dedicated query.
  // We'll add a `get` query to coverLetters.ts if not already present.
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

  // Load content when cover letter data arrives
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
            <Button
              variant={editor.isActive("bold") ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("italic") ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("underline") ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("bulletList") ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("orderedList") ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="min-h-[400px] rounded-md border p-4">
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            Save Cover Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
}
```

- [ ] **Step 4: Add `get` query to cover letters for direct lookup**

Add to the top of `convex/coverLetters.ts` (after existing queries):

```typescript
export const get = query({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

Then update the CoverLetterEditorModal to use this query instead of `getByBranch`. Replace the query line:

```typescript
const coverLetter = useQuery(
  api.coverLetters.get,
  coverLetterId ? { id: coverLetterId } : "skip"
);
```

- [ ] **Step 5: Verify modals work**

Run the app. Create a base resume (next task adds the builder, so for now verify the modals open/close without errors by adding a test base resume via Convex dashboard).

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/ convex/coverLetters.ts
git commit -m "feat: add branch modal, add content modal, and cover letter editor modal"
```

---

## Task 7: Resume Builder — Editor Tab

**Files:**
- Create: `src/app/resume/layout.tsx`, `src/app/resume/[id]/page.tsx`, `src/components/resume-builder/resume-builder.tsx`, `src/components/resume-builder/sidebar.tsx`, `src/components/resume-builder/editor-tab.tsx`, `src/components/resume-builder/section-header.tsx`, `src/components/resume-builder/contact-fields.tsx`, `src/components/resume-builder/experience-list.tsx`, `src/components/resume-builder/education-list.tsx`, `src/components/resume-builder/skills-list.tsx`, `src/components/resume-builder/certifications-list.tsx`

- [ ] **Step 1: Create SectionHeader component**

Create `src/components/resume-builder/section-header.tsx`:

```typescript
"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionHeader({ title, isOpen, onToggle }: SectionHeaderProps) {
  return (
    <button
      className="flex w-full items-center justify-between border-b py-2.5"
      onClick={onToggle}
    >
      <span className="text-sm font-semibold">{title}</span>
      <ChevronDown
        className={cn("h-[18px] w-[18px] text-gray-500 transition-transform", !isOpen && "-rotate-90")}
      />
    </button>
  );
}
```

- [ ] **Step 2: Create ContactFields component**

Create `src/components/resume-builder/contact-fields.tsx`:

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactInfo } from "@/lib/types";

interface ContactFieldsProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

export function ContactFields({ contact, onChange }: ContactFieldsProps) {
  function update(field: keyof ContactInfo, value: string) {
    onChange({ ...contact, [field]: value });
  }

  return (
    <div className="space-y-3 py-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">First Name</Label>
          <Input value={contact.firstName} onChange={(e) => update("firstName", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Last Name</Label>
          <Input value={contact.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Email</Label>
        <Input value={contact.email} onChange={(e) => update("email", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Phone Number</Label>
        <Input value={contact.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Location</Label>
        <Input value={contact.location} onChange={(e) => update("location", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">LinkedIn</Label>
        <Input value={contact.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ExperienceList component**

Create `src/components/resume-builder/experience-list.tsx`:

```typescript
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
    onChange([
      ...experience,
      {
        id: generateId(),
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
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
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) => updateEntry(index, { current: e.target.checked, endDate: "" })}
              className="h-3.5 w-3.5"
            />
            <Label className="text-xs">Currently working here</Label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description/Achievements</Label>
            <Textarea
              value={entry.description}
              onChange={(e) => updateEntry(index, { description: e.target.value })}
              placeholder="- Led a team of 5 engineers..."
              rows={4}
            />
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
```

- [ ] **Step 4: Create EducationList component**

Create `src/components/resume-builder/education-list.tsx`:

```typescript
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
    onChange([
      ...education,
      { id: generateId(), institution: "", degree: "", graduationDate: "" },
    ]);
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
          <div className="space-y-1.5">
            <Label className="text-xs">Institution</Label>
            <Input value={entry.institution} onChange={(e) => updateEntry(index, { institution: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Degree</Label>
              <Input value={entry.degree} onChange={(e) => updateEntry(index, { degree: e.target.value })} placeholder="B.S. Computer Science" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Graduation Date</Label>
              <Input type="month" value={entry.graduationDate} onChange={(e) => updateEntry(index, { graduationDate: e.target.value })} />
            </div>
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
```

- [ ] **Step 5: Create SkillsList component**

Create `src/components/resume-builder/skills-list.tsx`:

```typescript
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
  function addCategory() {
    onChange([...skills, { category: "", items: [] }]);
  }

  function updateCategory(index: number, category: string) {
    const updated = [...skills];
    updated[index] = { ...updated[index], category };
    onChange(updated);
  }

  function removeCategory(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  function addSkill(categoryIndex: number, skill: string) {
    if (!skill.trim()) return;
    const updated = [...skills];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      items: [...updated[categoryIndex].items, skill.trim()],
    };
    onChange(updated);
  }

  function removeSkill(categoryIndex: number, skillIndex: number) {
    const updated = [...skills];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      items: updated[categoryIndex].items.filter((_, i) => i !== skillIndex),
    };
    onChange(updated);
  }

  return (
    <div className="space-y-4 py-3">
      {skills.map((category, catIndex) => (
        <SkillCategoryEditor
          key={catIndex}
          category={category}
          index={catIndex}
          onUpdateCategory={(cat) => updateCategory(catIndex, cat)}
          onRemoveCategory={() => removeCategory(catIndex)}
          onAddSkill={(skill) => addSkill(catIndex, skill)}
          onRemoveSkill={(skillIndex) => removeSkill(catIndex, skillIndex)}
        />
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addCategory}>
        <Plus className="mr-2 h-3 w-3" />
        Add Category
      </Button>
    </div>
  );
}

function SkillCategoryEditor({
  category,
  index,
  onUpdateCategory,
  onRemoveCategory,
  onAddSkill,
  onRemoveSkill,
}: {
  category: SkillCategory;
  index: number;
  onUpdateCategory: (cat: string) => void;
  onRemoveCategory: () => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skillIndex: number) => void;
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
        <Input
          value={category.category}
          onChange={(e) => onUpdateCategory(e.target.value)}
          placeholder="e.g. Programming Languages"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {category.items.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
          >
            {skill}
            <button onClick={() => onRemoveSkill(skillIndex)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add skill..."
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddSkill(newSkill);
              setNewSkill("");
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onAddSkill(newSkill);
            setNewSkill("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create CertificationsList component**

Create `src/components/resume-builder/certifications-list.tsx`:

```typescript
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
  function addEntry() {
    onChange([
      ...certifications,
      { id: generateId(), name: "", issuer: "", date: "" },
    ]);
  }

  function updateEntry(index: number, updates: Partial<CertificationEntry>) {
    const updated = [...certifications];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(certifications.filter((_, i) => i !== index));
  }

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
        <Plus className="mr-2 h-3 w-3" />
        Add Certification
      </Button>
    </div>
  );
}
```

- [ ] **Step 7: Create EditorTab component**

Create `src/components/resume-builder/editor-tab.tsx`:

```typescript
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
    contact: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
  });

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateContent(updates: Partial<ResumeContent>) {
    onChange({ ...content, ...updates });
  }

  return (
    <div className="space-y-1 p-4">
      <div className="space-y-3 pb-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Target Job Title</Label>
          <Input
            value={content.targetJobTitle}
            onChange={(e) => updateContent({ targetJobTitle: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Resume Tag</Label>
          <Input
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="e.g. Software Engineering"
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>

      <SectionHeader title="Contact Details" isOpen={openSections.contact} onToggle={() => toggleSection("contact")} />
      {openSections.contact && (
        <ContactFields contact={content.contact} onChange={(contact) => updateContent({ contact })} />
      )}

      <SectionHeader title="Summary" isOpen={openSections.summary} onToggle={() => toggleSection("summary")} />
      {openSections.summary && (
        <div className="py-3">
          <Label className="text-xs">Professional Summary</Label>
          <Textarea
            value={content.summary}
            onChange={(e) => updateContent({ summary: e.target.value })}
            placeholder="Experienced software engineer with 5+ years..."
            rows={5}
            className="mt-1.5"
          />
        </div>
      )}

      <SectionHeader title="Work Experience" isOpen={openSections.experience} onToggle={() => toggleSection("experience")} />
      {openSections.experience && (
        <ExperienceList experience={content.experience} onChange={(experience) => updateContent({ experience })} />
      )}

      <SectionHeader title="Skills" isOpen={openSections.skills} onToggle={() => toggleSection("skills")} />
      {openSections.skills && (
        <SkillsList skills={content.skills} onChange={(skills) => updateContent({ skills })} />
      )}

      <SectionHeader title="Education" isOpen={openSections.education} onToggle={() => toggleSection("education")} />
      {openSections.education && (
        <EducationList education={content.education} onChange={(education) => updateContent({ education })} />
      )}

      <SectionHeader title="Certifications" isOpen={openSections.certifications} onToggle={() => toggleSection("certifications")} />
      {openSections.certifications && (
        <CertificationsList certifications={content.certifications} onChange={(certifications) => updateContent({ certifications })} />
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create Sidebar component**

Create `src/components/resume-builder/sidebar.tsx`:

```typescript
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

export function Sidebar({
  content,
  layoutSettings,
  category,
  categoryOptions,
  onContentChange,
  onLayoutChange,
  onCategoryChange,
}: SidebarProps) {
  return (
    <div className="flex w-[400px] flex-col border-r bg-white">
      <Tabs defaultValue="editor" className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="layout">Layout & Style</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 overflow-y-auto">
          <EditorTab
            content={content}
            category={category}
            onChange={onContentChange}
            onCategoryChange={onCategoryChange}
            categoryOptions={categoryOptions}
          />
        </TabsContent>
        <TabsContent value="layout" className="flex-1 overflow-y-auto">
          <LayoutStyleTab layout={layoutSettings} onChange={onLayoutChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 9: Create a placeholder LayoutStyleTab (will be filled in Task 8)**

Create `src/components/resume-builder/layout-style-tab.tsx`:

```typescript
"use client";

import type { LayoutSettings } from "@/lib/types";

interface LayoutStyleTabProps {
  layout: LayoutSettings;
  onChange: (layout: LayoutSettings) => void;
}

export function LayoutStyleTab({ layout, onChange }: LayoutStyleTabProps) {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-500">Layout & Style settings (coming next task)</p>
    </div>
  );
}
```

- [ ] **Step 10: Create a placeholder PreviewArea (will be filled in Task 9)**

Create `src/components/resume-builder/preview-area.tsx`:

```typescript
"use client";

import type { ResumeContent, LayoutSettings } from "@/lib/types";

interface PreviewAreaProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewArea({ content, layoutSettings }: PreviewAreaProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-10">
      <div className="h-[842px] w-[595px] rounded bg-white p-10 shadow">
        <p className="text-center text-gray-400">PDF Preview (coming in Task 9)</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Create ResumeBuilder container component**

Create `src/components/resume-builder/resume-builder.tsx`:

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { PreviewArea } from "./preview-area";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Download, Home } from "lucide-react";
import { DEFAULT_CONTENT, DEFAULT_LAYOUT } from "@/lib/defaults";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

export function ResumeBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  // Try loading as base resume first, then branch
  const baseResume = useQuery(api.baseResumes.get, isNew ? "skip" : { id: id as Id<"baseResumes"> });
  const branchResume = useQuery(
    api.branchResumes.get,
    isNew || baseResume !== undefined ? "skip" : { id: id as Id<"branchResumes"> }
  );
  const categories = useQuery(api.baseResumes.listCategories) ?? [];

  // Determine which resume we're editing
  const resume = baseResume ?? branchResume;
  const isBranch = branchResume !== null && branchResume !== undefined;

  // For branch, load parent base resume for breadcrumb
  const parentBase = useQuery(
    api.baseResumes.get,
    isBranch && branchResume ? { id: branchResume.baseResumeId } : "skip"
  );

  const createBase = useMutation(api.baseResumes.create);
  const updateBase = useMutation(api.baseResumes.update);
  const updateBranch = useMutation(api.branchResumes.update);

  const [content, setContent] = useState<ResumeContent>(DEFAULT_CONTENT);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const hasCreated = useRef(false);
  const createdId = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load resume data when it arrives
  useEffect(() => {
    if (resume) {
      setContent(resume.content as ResumeContent);
      setLayoutSettings(resume.layoutSettings as LayoutSettings);
      if ("category" in resume) setCategory((resume as any).category ?? "");
      setTitle((resume as any).title ?? "");
    }
  }, [resume]);

  // Auto-save with debounce
  const save = useCallback(
    (newContent: ResumeContent, newLayout: LayoutSettings, newCategory: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (isNew && !hasCreated.current) {
          hasCreated.current = true;
          const newTitle = `${newContent.contact.firstName} ${newContent.contact.lastName} - ${newContent.targetJobTitle} - Base Resume`.trim();
          const newId = await createBase({
            title: newTitle || "Untitled Resume",
            category: newCategory || "Uncategorized",
            content: newContent,
            layoutSettings: newLayout,
          });
          createdId.current = newId;
          router.replace(`/resume/${newId}`);
        } else if (createdId.current || !isNew) {
          const resumeId = (createdId.current ?? id) as Id<"baseResumes">;
          if (isBranch) {
            await updateBranch({
              id: resumeId as unknown as Id<"branchResumes">,
              content: newContent,
              layoutSettings: newLayout,
            });
          } else {
            const newTitle = `${newContent.contact.firstName} ${newContent.contact.lastName} - ${newContent.targetJobTitle} - Base Resume`.trim();
            await updateBase({
              id: resumeId,
              title: newTitle || "Untitled Resume",
              category: newCategory || "Uncategorized",
              content: newContent,
              layoutSettings: newLayout,
            });
          }
        }
      }, 500);
    },
    [isNew, id, isBranch, createBase, updateBase, updateBranch, router]
  );

  function handleContentChange(newContent: ResumeContent) {
    setContent(newContent);
    save(newContent, layoutSettings, category);
  }

  function handleLayoutChange(newLayout: LayoutSettings) {
    setLayoutSettings(newLayout);
    save(content, newLayout, category);
  }

  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    save(content, layoutSettings, newCategory);
  }

  const breadcrumb = isBranch && parentBase ? (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Home</Link>
      <span className="text-gray-400">&gt;</span>
      <span className="text-gray-500">{parentBase.category}</span>
      <span className="text-gray-400">&gt;</span>
      <span className="text-gray-500">{parentBase.title}</span>
      <span className="text-gray-400">&gt;</span>
      <span className="font-medium">{(branchResume as any)?.companyName} Branch</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Home</Link>
      <span className="text-gray-400">&gt;</span>
      <span className="font-medium">{title || "New Resume"}</span>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="flex h-14 items-center justify-between border-b bg-white px-6">
        {breadcrumb}
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      {isBranch && branchResume && (
        <div className="border-b bg-blue-50 px-6 py-2 text-sm text-blue-700">
          Branch of {parentBase?.title} &middot; {(branchResume as any).companyName}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          content={content}
          layoutSettings={layoutSettings}
          category={category}
          categoryOptions={categories}
          onContentChange={handleContentChange}
          onLayoutChange={handleLayoutChange}
          onCategoryChange={handleCategoryChange}
        />
        <PreviewArea content={content} layoutSettings={layoutSettings} />
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Create resume page and layout**

Create `src/app/resume/layout.tsx`:

```typescript
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

Create `src/app/resume/[id]/page.tsx`:

```typescript
"use client";

import { ResumeBuilder } from "@/components/resume-builder/resume-builder";

export default function ResumePage() {
  return <ResumeBuilder />;
}
```

- [ ] **Step 13: Verify resume builder renders**

Run the app. Click "New Base Resume" from dashboard. Verify the sidebar form appears with all sections. Fill in some fields and verify no console errors.

- [ ] **Step 14: Commit**

```bash
git add src/
git commit -m "feat: add resume builder page with editor tab, form sections, and auto-save"
```

---

## Task 8: Resume Builder — Layout & Style Tab

**Files:**
- Modify: `src/components/resume-builder/layout-style-tab.tsx`

- [ ] **Step 1: Implement the full LayoutStyleTab**

Replace `src/components/resume-builder/layout-style-tab.tsx`:

```typescript
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
    fonts: true,
    typography: true,
    dateFormat: true,
    page: true,
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
        textStyle: {
          ...layout.typography.textStyle,
          [field]: !layout.typography.textStyle[field],
        },
      },
    });
  }

  function updateMargins(field: keyof LayoutSettings["page"]["margins"], value: number) {
    onChange({
      ...layout,
      page: {
        ...layout.page,
        margins: { ...layout.page.margins, [field]: value },
      },
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
              <Select value={layout.fonts[field]} onValueChange={(v) => updateFonts(field, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
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
                <Input
                  type="number"
                  min={8}
                  max={16}
                  step={0.5}
                  value={layout.typography.fontSize}
                  onChange={(e) => updateTypography({ fontSize: parseFloat(e.target.value) || 11 })}
                  className="w-20"
                />
                <span className="text-xs text-gray-500">pt</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Line Height</Label>
              <Input
                type="number"
                min={1}
                max={2.5}
                step={0.1}
                value={layout.typography.lineHeight}
                onChange={(e) => updateTypography({ lineHeight: parseFloat(e.target.value) || 1.5 })}
                className="w-20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Text Style</Label>
            <div className="flex gap-1">
              <Button
                variant={layout.typography.textStyle.bold ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateTextStyle("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={layout.typography.textStyle.italic ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateTextStyle("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={layout.typography.textStyle.underline ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => updateTextStyle("underline")}
              >
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
            <label
              key={option.value}
              className={`flex cursor-pointer items-center rounded-md border p-3 ${
                layout.dateFormat === option.value ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="dateFormat"
                value={option.value}
                checked={layout.dateFormat === option.value}
                onChange={() => onChange({ ...layout, dateFormat: option.value })}
                className="mr-3"
              />
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
            <Select
              value={layout.page.size}
              onValueChange={(v) => onChange({ ...layout, page: { ...layout.page, size: v as "a4" | "letter" } })}
            >
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
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={layout.page.margins[side]}
                    onChange={(e) => updateMargins(side, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify Layout & Style tab works**

Run the app. Go to resume builder. Switch to "Layout & Style" tab. Change font settings, typography, date format, page settings. Verify no errors and values persist (auto-save triggers).

- [ ] **Step 3: Commit**

```bash
git add src/components/resume-builder/layout-style-tab.tsx
git commit -m "feat: implement layout & style tab with font, typography, date format, and page settings"
```

---

## Task 9: PDF Preview & Export (@react-pdf/renderer)

**Files:**
- Create: `src/components/resume-builder/resume-pdf-document.tsx`
- Modify: `src/components/resume-builder/preview-area.tsx`, `src/components/resume-builder/resume-builder.tsx`

- [ ] **Step 1: Create the ResumePDFDocument component**

Create `src/components/resume-builder/resume-pdf-document.tsx`:

```typescript
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ResumePDFDocumentProps {
  content: ResumeContent;
  layout: LayoutSettings;
}

// Page size map in pt (1mm = 2.835pt)
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

function mmToPt(mm: number) {
  return mm * 2.835;
}

export function ResumePDFDocument({ content, layout }: ResumePDFDocumentProps) {
  const pageSize = PAGE_SIZES[layout.page.size];
  const margins = {
    top: mmToPt(layout.page.margins.top),
    right: mmToPt(layout.page.margins.right),
    bottom: mmToPt(layout.page.margins.bottom),
    left: mmToPt(layout.page.margins.left),
  };

  const baseFontSize = layout.typography.fontSize;
  const lineHeight = layout.typography.lineHeight;

  const styles = StyleSheet.create({
    page: {
      paddingTop: margins.top,
      paddingRight: margins.right,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      fontFamily: "Helvetica",
      fontSize: baseFontSize,
      lineHeight,
    },
    name: {
      fontSize: baseFontSize * 2,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: baseFontSize + 1,
      textAlign: "center",
      color: "#4B5563",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      fontSize: baseFontSize - 1,
      color: "#6B7280",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: baseFontSize + 2,
      fontWeight: "bold",
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      paddingBottom: 2,
      marginTop: 12,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    bold: {
      fontWeight: "bold",
    },
    italic: {
      fontStyle: "italic",
    },
    gray: {
      color: "#6B7280",
    },
    bulletPoint: {
      flexDirection: "row",
      marginLeft: 10,
      marginBottom: 2,
    },
    bullet: {
      width: 10,
    },
    bulletText: {
      flex: 1,
    },
    skillRow: {
      flexDirection: "row",
      marginBottom: 2,
    },
    skillCategory: {
      fontWeight: "bold",
      marginRight: 4,
    },
  });

  const fullName = `${content.contact.firstName} ${content.contact.lastName}`.trim();
  const contactItems = [
    content.contact.email,
    content.contact.phone,
    content.contact.location,
    content.contact.linkedin,
  ].filter(Boolean);

  return (
    <Document>
      <Page size={[pageSize.width, pageSize.height]} style={styles.page}>
        {/* Name */}
        {fullName && <Text style={styles.name}>{fullName}</Text>}

        {/* Job Title */}
        {content.targetJobTitle && (
          <Text style={styles.subtitle}>{content.targetJobTitle}</Text>
        )}

        {/* Contact Info */}
        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i}>{item}{i < contactItems.length - 1 ? "  |  " : ""}</Text>
            ))}
          </View>
        )}

        {/* Summary */}
        {content.summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text>{content.summary}</Text>
          </>
        )}

        {/* Experience */}
        {content.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {content.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{exp.title}</Text>
                  <Text style={styles.gray}>
                    {formatDate(exp.startDate, layout.dateFormat)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate, layout.dateFormat)}
                  </Text>
                </View>
                <Text style={styles.italic}>{exp.company}</Text>
                {exp.description.split("\n").filter(Boolean).map((line, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{line.replace(/^[-•]\s*/, "")}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {content.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            {content.skills.map((cat, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{cat.category}:</Text>
                <Text>{cat.items.join(", ")}</Text>
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {content.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{edu.degree}</Text>
                  <Text style={styles.gray}>{formatDate(edu.graduationDate, layout.dateFormat)}</Text>
                </View>
                <Text style={styles.italic}>{edu.institution}</Text>
              </View>
            ))}
          </>
        )}

        {/* Certifications */}
        {content.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {content.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{cert.name}</Text>
                  <Text style={styles.gray}>{formatDate(cert.date, layout.dateFormat)}</Text>
                </View>
                <Text style={styles.italic}>{cert.issuer}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Implement the PreviewArea with live PDF rendering**

Replace `src/components/resume-builder/preview-area.tsx`:

```typescript
"use client";

import dynamic from "next/dynamic";
import type { ResumeContent, LayoutSettings } from "@/lib/types";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

const ResumePDFDocument = dynamic(
  () => import("./resume-pdf-document").then((mod) => ({ default: mod.ResumePDFDocument })),
  { ssr: false }
);

interface PreviewAreaProps {
  content: ResumeContent;
  layoutSettings: LayoutSettings;
}

export function PreviewArea({ content, layoutSettings }: PreviewAreaProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-10">
      <PDFViewer width="100%" height="100%" showToolbar={false} className="rounded shadow-lg">
        <ResumePDFDocument content={content} layout={layoutSettings} />
      </PDFViewer>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-[842px] w-[595px] animate-pulse rounded bg-gray-200" />
    </div>
  );
}
```

- [ ] **Step 3: Add PDF export functionality to ResumeBuilder**

In `src/components/resume-builder/resume-builder.tsx`, add the export handler. Add this import at the top:

```typescript
import { pdf } from "@react-pdf/renderer";
import { ResumePDFDocument } from "./resume-pdf-document";
```

Then replace the Export PDF button's onClick:

```typescript
<Button onClick={async () => {
  const blob = await pdf(
    <ResumePDFDocument content={content} layout={layoutSettings} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "resume"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}}>
  <Download className="mr-2 h-4 w-4" />
  Export PDF
</Button>
```

Note: The `pdf` import and `ResumePDFDocument` must be dynamically imported for client-side only. Wrap the export handler:

```typescript
async function handleExport() {
  const { pdf } = await import("@react-pdf/renderer");
  const { ResumePDFDocument } = await import("./resume-pdf-document");
  const blob = await pdf(
    <ResumePDFDocument content={content} layout={layoutSettings} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "resume"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
```

And use `onClick={handleExport}` on the button.

- [ ] **Step 4: Verify PDF preview renders and export works**

Run the app. Go to resume builder. Fill in some content. Verify:
- The right panel shows a live PDF preview
- The preview updates as you type (with debounce)
- Clicking "Export PDF" downloads a PDF file
- Open the PDF and verify text is selectable (ATS-friendly)

- [ ] **Step 5: Commit**

```bash
git add src/components/resume-builder/
git commit -m "feat: add live PDF preview with @react-pdf/renderer and PDF export"
```

---

## Task 10: Final Integration & Polish

**Files:**
- Modify: Various files for bug fixes and integration

- [ ] **Step 1: Add delete confirmation dialog**

Install alert-dialog from shadcn:

```bash
npx shadcn@latest add alert-dialog
```

Create a reusable confirmation wrapper. In `src/components/dashboard/resume-table.tsx`, wrap delete calls with a confirmation:

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
```

Add a state for tracking the delete action:

```typescript
const [deleteAction, setDeleteAction] = useState<{ type: string; id: string; name: string } | null>(null);
```

Add the dialog to the ResumeTable return JSX (before the closing `</div>`):

```typescript
<AlertDialog open={deleteAction !== null} onOpenChange={(open) => !open && setDeleteAction(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {deleteAction?.type}?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete &quot;{deleteAction?.name}&quot;
        {deleteAction?.type === "base resume" && " and all its branches and cover letters"}.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-red-600 hover:bg-red-700"
        onClick={() => {
          if (!deleteAction) return;
          // Execute the delete
          if (deleteAction.type === "base resume") deleteBase({ id: deleteAction.id as any });
          else if (deleteAction.type === "branch") deleteBranch({ id: deleteAction.id as any });
          else if (deleteAction.type === "cover letter") deleteCoverLetter({ id: deleteAction.id as any });
          setDeleteAction(null);
        }}
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Update the delete callbacks to set `deleteAction` state instead of calling mutations directly.

- [ ] **Step 2: Add "Add Content" button to branch rows**

In `src/components/dashboard/branch-resume-row.tsx`, add a button for adding content:

```typescript
import { Plus } from "lucide-react";

// Add before the edit button in the actions cell:
<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddContent} title="Add content">
  <Plus className="h-4 w-4" />
</Button>
```

- [ ] **Step 3: Handle loading states**

In `src/components/dashboard/resume-table.tsx`, add loading state:

```typescript
const isLoading = baseResumes === undefined;

if (isLoading) {
  return (
    <div className="flex items-center justify-center p-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

if (baseResumes.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <FileText className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
      <p className="mt-1 text-sm text-gray-500">Create your first base resume to get started.</p>
    </div>
  );
}
```

- [ ] **Step 4: Configure Convex auth for Clerk**

Create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

Add to `.env.local`:

```
CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-domain>.clerk.accounts.dev
```

Note: You'll also need to configure Clerk to issue JWTs for Convex. In the Clerk Dashboard, go to JWT Templates, create a "convex" template following Convex's documentation.

- [ ] **Step 5: End-to-end verification**

Run `npm run dev` and `npx convex dev`. Test the full flow:

1. Sign up / sign in
2. Click "New Base Resume" → verify redirect to builder
3. Fill in all resume fields → verify auto-save
4. Switch to Layout & Style tab → change settings → verify preview updates
5. Click "Export PDF" → verify download, verify text is selectable
6. Go back to dashboard → verify resume appears in table
7. Click duplicate on base resume → verify Branch Modal opens
8. Create a branch → verify redirect to branch editor
9. Edit branch → verify it doesn't affect base
10. Add cover letter to branch → edit in Tiptap → save
11. Verify cover letter appears in dashboard table under branch
12. Change branch status → verify pill updates
13. Delete a branch → verify cascade deletes cover letter
14. Delete a base → verify cascade deletes branches

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add delete confirmations, loading states, and final integration polish"
```
