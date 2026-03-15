import type { InvoiceStatus } from "@/data/mockData";
import { statusLabels } from "@/data/mockData";

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md";
}

const statusClasses: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600 border border-gray-200",
  sent: "bg-blue-50 text-blue-700 border border-blue-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  overdue: "bg-red-50 text-red-700 border border-red-200",
};

const dotColors: Record<InvoiceStatus, string> = {
  draft: "bg-gray-400",
  sent: "bg-blue-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${statusClasses[status]} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      {statusLabels[status]}
    </span>
  );
}
