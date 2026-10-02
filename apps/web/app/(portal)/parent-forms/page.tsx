import PageShell from "@/components/layout/page-shell";
import { FilteredEmptyState } from "@/components/ui/filtered-empty-state";

export default function Page() {
  return (
    <PageShell title="Coming Soon" description="This module is currently under development.">
      <div className="pt-10">
        <FilteredEmptyState
          title="Module Under Construction"
          description="We are working hard to bring this feature to you soon. Please check back later."
        />
      </div>
    </PageShell>
  );
}
