import { Badge } from "@/components/ui/badge";

export const statusMeta = {
  new: { label: "Nový", className: "bg-blue-50 text-blue-700 border-blue-100" },
  answered: { label: "Odpovězeno", className: "bg-violet-50 text-violet-700 border-violet-100" },
  qualified: { label: "Kvalifikováno", className: "bg-amber-50 text-amber-800 border-amber-100" },
  meeting_scheduled: { label: "Domluvená schůzka", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  lost: { label: "Ztracený", className: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

export type LeadStatus = keyof typeof statusMeta;

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = statusMeta[status];
  return <Badge variant="outline" className={`rounded-full px-2.5 py-1 font-semibold ${meta.className}`}>{meta.label}</Badge>;
}
