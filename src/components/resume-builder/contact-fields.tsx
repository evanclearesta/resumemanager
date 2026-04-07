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
