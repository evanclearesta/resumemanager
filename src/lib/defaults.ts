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
