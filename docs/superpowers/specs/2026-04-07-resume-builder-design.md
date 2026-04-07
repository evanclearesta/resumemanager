# Resume Builder & Management App — Design Spec

## Context

A web-based resume builder and management tool that lets users create base resumes, branch them for specific job applications, manage application status, and generate ATS-friendly PDFs. The app supports cover letters attached to branches.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** Clerk
- **Backend/DB:** Convex
- **PDF Rendering:** @react-pdf/renderer
- **Rich Text Editor:** Tiptap (for cover letters)

## Data Model (Convex)

### users (synced from Clerk via webhook)

| Field    | Type   | Description          |
|----------|--------|----------------------|
| clerkId  | string | Clerk user ID        |
| email    | string | User email           |
| name     | string | Display name         |
| imageUrl | string | Profile image URL    |

### baseResumes

| Field          | Type   | Description                              |
|----------------|--------|------------------------------------------|
| userId         | Id<"users"> | Owner                               |
| title          | string | e.g. "John Doe - SWE - Base Resume"     |
| category       | string | Free-text tag set in the Resume Builder editor sidebar (e.g. "Software Engineering", "Product Management"). Existing categories shown as suggestions. Used to group resumes in the dashboard table. |
| content        | object | Resume content (see below)               |
| layoutSettings | object | Layout & style settings (see below)      |
| status         | string | "draft"                                  |
| lastEditedAt   | number | Timestamp                                |

### branchResumes

| Field          | Type              | Description                          |
|----------------|-------------------|--------------------------------------|
| userId         | Id<"users">       | Owner                                |
| baseResumeId   | Id<"baseResumes"> | Parent base resume                   |
| companyName    | string            | Target company                       |
| roleName       | string            | Target role                          |
| jobDescription | string (optional) | Job posting description              |
| jobUrl         | string (optional) | Job posting URL                      |
| content        | object            | Deep copy of base resume content     |
| layoutSettings | object            | Deep copy of base layout settings    |
| status         | string            | "draft" | "submitted" | "interview" | "offered" | "rejected" |
| lastEditedAt   | number            | Timestamp                            |

### coverLetters

| Field          | Type                 | Description              |
|----------------|----------------------|--------------------------|
| userId         | Id<"users">          | Owner                    |
| branchResumeId | Id<"branchResumes">  | Parent branch            |
| content        | string (JSON)        | Tiptap editor JSON       |
| targetCompany  | string               | Pre-filled from branch   |
| status         | string               | "draft" | "sent"         |
| lastEditedAt   | number               | Timestamp                |

### Content Object Shape

```typescript
interface ResumeContent {
  targetJobTitle: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string; // bullet points as text
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    graduationDate: string;
  }[];
  skills: {
    category: string; // e.g. "Programming Languages"
    items: string[];  // e.g. ["JavaScript", "TypeScript"]
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
}
```

### Layout Settings Shape

```typescript
interface LayoutSettings {
  fonts: {
    title: string;   // e.g. "Inter"
    heading: string;
    body: string;
  };
  typography: {
    fontSize: number;    // base font size in pt
    lineHeight: number;  // multiplier
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
```

## Pages & Routes

### 1. Dashboard — `/dashboard`

**Table view** showing all resumes grouped by category.

**Table columns:** Name, Target, Status, Last Edited, Actions

**Features:**
- Collapsible category groups (e.g. "Software Engineering") with base resume count badge
- Base resumes shown as top-level rows with "Base" pill
- Branch resumes indented under their parent base with tree connector icon
- Cover letters shown as child rows under their branch (with document icon)
- Status pills color-coded: Draft (gray), Submitted (blue), Interview (orange), Offered (green), Rejected (red)
- Action buttons per row: Edit (pencil), Duplicate (copy), Delete (trash)
  - Duplicating a base resume creates a branch (opens Branch Modal)
  - Duplicating a branch creates another branch under the same base
- "New Base Resume" button in top bar navigates to `/resume/new`

**Modals:**
- **Branch Modal:** Create new branch with fields: Parent Resume (dropdown), Company Name, Role Name, Job Description (textarea), Job URL
- **Add Content Modal:** Choose content type to add to a branch (Cover Letter). Creates the content and opens its editor.
- **Cover Letter Editor Modal:** Tiptap rich text editor with formatting toolbar (bold, italic, underline, lists). Fields: target company (pre-filled), date, content area. Save/close actions.

### 2. Resume Builder — `/resume/[id]`

**Split view** with left sidebar (400px) and right preview area.

**Sidebar has two tabs:**
- **Editor tab:** Top fields: Target Job Title, Job Title, Resume Tag (free-text with autocomplete from existing categories — this sets the base resume's category for dashboard grouping). Then collapsible sections (using SectionHeader component) for Contact Details, Summary, Work Experience, Skills, Education, Certifications. Experience/Education/Skills/Certifications sections have add/remove/reorder capabilities.
- **Layout & Style tab:** Font settings (title/heading/body font selects), Typography (font size, line height, text style toggles), Date format (radio group with 4 options), Page settings (size dropdown, margin inputs for left/right/top/bottom).

**Preview area:**
- Live `@react-pdf/renderer` preview that updates as the user edits
- Rendered at the selected page size with correct margins
- Shows actual resume formatting with chosen fonts and typography

**Top bar:**
- For base resumes: "Home" link + resume title
- For branch resumes: Breadcrumb (Home > Name > Category > Base Resume > Branch Name) + banner showing "Branch of [Base] > [Company]"
- "Export PDF" button (right side) triggers download of the PDF

### 3. Auth Pages — `/sign-in`, `/sign-up`

Clerk-managed authentication pages.

## Key Interactions

1. **Create base resume:** Click "New Base Resume" → navigates to `/resume/new` → fill in editor → auto-saves to Convex
2. **Create branch:** Click duplicate on a base resume → Branch Modal → fill company/role → creates deep copy → navigates to `/resume/[branchId]`
3. **Edit resume:** Click edit icon → navigates to `/resume/[id]` (works for both base and branch)
4. **Add cover letter:** Click "add content" on a branch row → Add Content Modal → select Cover Letter → Cover Letter Editor Modal opens
5. **Edit cover letter:** Click edit on cover letter row → Cover Letter Editor Modal opens
6. **Export PDF:** Click "Export PDF" in resume builder → downloads PDF using same @react-pdf/renderer document
7. **Delete:** Click delete icon → confirmation dialog → removes from Convex (branches cascade-delete their cover letters)
8. **Update status:** Click status pill on branch → dropdown to change status

## Component Architecture

```
App Layout
├── ClerkProvider
│   └── ConvexProviderWithClerk
│       ├── Dashboard Page
│       │   ├── TopBar (logo + "New Base Resume" button)
│       │   ├── ResumeTable
│       │   │   ├── CategoryGroup (collapsible)
│       │   │   │   ├── BaseResumeRow
│       │   │   │   │   ├── BranchResumeRow
│       │   │   │   │   │   └── CoverLetterRow
│       │   │   │   │   └── BranchResumeRow
│       │   │   │   └── BaseResumeRow
│       │   │   └── CategoryGroup
│       │   ├── BranchModal (dialog)
│       │   ├── AddContentModal (dialog)
│       │   └── CoverLetterEditorModal (dialog)
│       └── Resume Builder Page
│           ├── TopBar (breadcrumb + Export PDF)
│           ├── Sidebar
│           │   ├── EditorTab
│           │   │   ├── SectionHeader + ContactFields
│           │   │   ├── SectionHeader + SummaryField
│           │   │   ├── SectionHeader + ExperienceList
│           │   │   ├── SectionHeader + EducationList
│           │   │   ├── SectionHeader + SkillsList
│           │   │   └── SectionHeader + CertificationsList
│           │   └── LayoutStyleTab
│           │       ├── FontSettings
│           │       ├── Typography
│           │       ├── DateFormat
│           │       └── PageSettings
│           └── PreviewArea
│               └── PDFViewer (@react-pdf/renderer)
```

## Auto-Save Strategy

Use Convex mutations with debouncing (500ms) on content/layout changes. No manual save button needed — all changes persist automatically.

## Verification Plan

1. **Auth flow:** Sign up, sign in, verify protected routes redirect to sign-in
2. **Base resume CRUD:** Create base resume, edit all fields, verify preview updates live, delete
3. **Branching:** Duplicate base → verify branch modal → verify deep copy has all data → edit branch without affecting base
4. **Cover letters:** Add cover letter to branch → edit with Tiptap → save → verify it appears in dashboard table
5. **Status management:** Change branch status → verify pill color updates in table
6. **PDF export:** Export PDF → open in PDF viewer → verify text is selectable (ATS-friendly) → verify formatting matches preview
7. **Layout & Style:** Change fonts, font size, margins, date format → verify preview updates correctly
8. **Responsive:** Verify dashboard table and resume builder work on common screen sizes
