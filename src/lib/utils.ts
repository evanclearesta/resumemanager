import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
