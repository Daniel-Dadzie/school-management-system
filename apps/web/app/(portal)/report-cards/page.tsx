import PageShell from "@/components/layout/page-shell";
import { StudentResultsList } from "@/components/assessments/student-results-list";
import { permissions } from "@/lib/authorization/permissions";
export default function ReportCardsOverview() { return <PageShell title="Report cards" description="Preview a student's term report card and print it from the browser." breadcrumbs={[{ label: "Report cards" }]} permission={permissions.resultsView}><StudentResultsList reportCards /></PageShell>; }
