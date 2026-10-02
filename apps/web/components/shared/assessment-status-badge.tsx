import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AssessmentResultOutcome, AssessmentStatus } from "@/lib/functional/types";

type AssessmentDisplayStatus = AssessmentStatus | AssessmentResultOutcome;

const statusDetails: Record<AssessmentDisplayStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  DRAFT: { label: "Draft", className: "border-info text-info", Icon: Clock3 },
  REJECTED: { label: "Rejected", className: "border-destructive text-destructive", Icon: XCircle },
  PASSED: { label: "Passed", className: "border-success text-success", Icon: CheckCircle2 },
  FAILED: { label: "Failed", className: "border-destructive text-destructive", Icon: XCircle },
};

export function AssessmentStatusBadge({ status }: { status: AssessmentDisplayStatus }) {
  const { label, className, Icon } = statusDetails[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
