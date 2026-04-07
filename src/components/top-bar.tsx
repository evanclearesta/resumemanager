import { FileText } from "lucide-react";

interface TopBarProps {
  rightActions?: React.ReactNode;
}

export function TopBar({ rightActions }: TopBarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b bg-white px-4 md:px-8">
      <div className="flex items-center gap-2.5">
        <FileText className="h-[22px] w-[22px] text-blue-500" />
        <span className="text-lg font-bold">ResumeBuilder</span>
      </div>
      {rightActions && <div className="flex items-center gap-3">{rightActions}</div>}
    </div>
  );
}
