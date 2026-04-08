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
  country: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  country: string;
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
