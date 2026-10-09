"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAssessmentReferences, useCreateAssessmentCategory, useAssessmentPolicy, useUpdateAssessmentPolicy, useGradingSchemes, useCreateGradingScheme, useGradeBands, useSaveGradeBand, useDeleteGradeBand } from "@/hooks/use-assessments";
import { permissions } from "@/lib/authorization/permissions";

function SchemeBandsEditor({ schemeId }: { schemeId: string }) {
  const { data: bands, isLoading, isError } = useGradeBands(schemeId);
  const saveBand = useSaveGradeBand(schemeId);
  const deleteBand = useDeleteGradeBand(schemeId);

  const [drafts, setDrafts] = useState<Record<string, any>>({});

  const handleUpdateDraft = (id: string, field: string, value: any) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || bands?.find(b => b.id === id) || {}), [field]: value }
    }));
  };

  const handleSave = (id: string) => {
    const data = drafts[id] || bands?.find(b => b.id === id);
    if (!data) return;
    saveBand.mutate({
      bandId: id.startsWith('new-') ? undefined : id,
      grade: data.grade,
      minimumScore: Number(data.minimumScore),
      maximumScore: Number(data.maximumScore),
      remark: data.remark || '',
      sequence: Number(data.sequence) || 0,
      isPass: Boolean(data.isPass)
    }, {
      onSuccess: () => {
        toast.success("Grade band saved");
        setDrafts(prev => { const next = { ...prev }; delete next[id]; return next; });
      },
      onError: (err) => toast.error(err.message || "Failed to save band")
    });
  };

  const [newBandsCount, setNewBandsCount] = useState(0);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p className="text-sm text-destructive">Failed to load grade bands.</p>;

  const displayBands = [...(bands || []), ...Array.from({ length: newBandsCount }).map((_, i) => ({ id: `new-${i}`, grade: '', minimumScore: 0, maximumScore: 0, remark: '', sequence: 0, isPass: true }))];
  displayBands.sort((a, b) => {
    const seqA = drafts[a.id]?.sequence ?? a.sequence;
    const seqB = drafts[b.id]?.sequence ?? b.sequence;
    return seqA - seqB;
  });

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold">Grade Bands</h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Grade</th>
              <th className="px-3 py-2 font-medium">Min %</th>
              <th className="px-3 py-2 font-medium">Max %</th>
              <th className="px-3 py-2 font-medium">Remark</th>
              <th className="px-3 py-2 font-medium">Pass?</th>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayBands.map((band) => {
              const current = drafts[band.id] || band;
              const isDraft = !!drafts[band.id] || band.id.startsWith('new-');
              return (
                <tr key={band.id} className="border-t">
                  <td className="px-3 py-2">
                    <Input className="h-8" value={current.grade} onChange={(e) => handleUpdateDraft(band.id, 'grade', e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-8" type="number" min="0" max="100" step="0.01" value={current.minimumScore} onChange={(e) => handleUpdateDraft(band.id, 'minimumScore', e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-8" type="number" min="0" max="100" step="0.01" value={current.maximumScore} onChange={(e) => handleUpdateDraft(band.id, 'maximumScore', e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-8" value={current.remark} onChange={(e) => handleUpdateDraft(band.id, 'remark', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={current.isPass} onChange={(e) => handleUpdateDraft(band.id, 'isPass', e.target.checked)} />
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-8 w-16" type="number" value={current.sequence} onChange={(e) => handleUpdateDraft(band.id, 'sequence', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <Button size="sm" variant="outline" disabled={!isDraft || saveBand.isPending} onClick={() => handleSave(band.id)}>Save</Button>
                    {!band.id.startsWith('new-') && (
                      <Button size="sm" variant="destructive" onClick={() => deleteBand.mutate(band.id)} disabled={deleteBand.isPending}>Delete</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" onClick={() => setNewBandsCount(c => c + 1)}>Add Band</Button>
    </div>
  );
}

export default function GradingConfigurationPage() {
  const policyQuery = useAssessmentPolicy();
  const schemesQuery = useGradingSchemes();
  const updatePolicy = useUpdateAssessmentPolicy();
  const createScheme = useCreateGradingScheme();
  
  const referencesQuery = useAssessmentReferences();
  const createCategory = useCreateAssessmentCategory();
  const [categoryName, setCategoryName] = useState("");

  const [newSchemeName, setNewSchemeName] = useState("");
  const [newSchemeDesc, setNewSchemeDesc] = useState("");

  const policy = policyQuery.data;
  const schemes = schemesQuery.data ?? [];

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const activeSchemeId = selectedSchemeId || policy?.gradingSchemeId || (schemes.length > 0 ? schemes[0].id : "");

  const [draftPolicy, setDraftPolicy] = useState<{ passMark?: number; roundingRule?: string }>({});

  const handleSavePolicy = () => {
    if (!policy) return;
    updatePolicy.mutate({
      gradingSchemeId: activeSchemeId,
      passMark: draftPolicy.passMark ?? policy.passMark,
      roundingRule: draftPolicy.roundingRule ?? policy.roundingRule,
    }, {
      onSuccess: () => { toast.success("Policy saved"); setDraftPolicy({}); },
      onError: (err) => toast.error(err.message || "Failed to save policy")
    });
  };

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    createScheme.mutate({ name: newSchemeName, description: newSchemeDesc }, {
      onSuccess: (res) => {
        toast.success("Scheme created");
        setNewSchemeName("");
        setNewSchemeDesc("");
        setSelectedSchemeId(res.id);
      }
    });
  };

  const isLoading = policyQuery.isLoading || schemesQuery.isLoading;
  const isError = policyQuery.isError || schemesQuery.isError;

  return (
    <PageShell title="Grading Configuration" description="Configure assessment policy and grade bands for the school." breadcrumbs={[{ label: "Academics", href: "/academic-setup" }, { label: "Grading scale" }]} permission={permissions.academicsManage}>
      {isLoading ? <div className="flex min-h-40 items-center justify-center"><LoadingSpinner /></div> : isError ? <p role="alert" className="rounded-md border border-destructive p-4 text-sm">Unable to load grading configuration.</p> : (
        <div className="max-w-5xl space-y-8">
          {/* Assessment Policy Section */}
          <section className="space-y-4 rounded-lg border bg-card p-4">
            <div>
              <h2 className="font-semibold text-lg">Assessment Policy</h2>
              <p className="text-sm text-muted-foreground">Set global grading parameters.</p>
            </div>
            {policy && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pass Mark (%)</label>
                  <Input type="number" step="0.01" value={draftPolicy.passMark ?? policy.passMark} onChange={(e) => setDraftPolicy({ ...draftPolicy, passMark: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rounding Rule</label>
                  <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={draftPolicy.roundingRule ?? policy.roundingRule} onChange={(e) => setDraftPolicy({ ...draftPolicy, roundingRule: e.target.value })}>
                    <option value="NONE">None</option>
                    <option value="HALF_UP">Half Up</option>
                    <option value="CEILING">Ceiling</option>
                    <option value="FLOOR">Floor</option>
                  </select>
                </div>
                <div>
                  <Button onClick={handleSavePolicy} disabled={updatePolicy.isPending || (draftPolicy.passMark === undefined && draftPolicy.roundingRule === undefined && activeSchemeId === policy.gradingSchemeId)}>
                    {updatePolicy.isPending ? "Saving..." : "Save Policy"}
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Grading Schemes Section */}
          <section className="space-y-4 rounded-lg border bg-card p-4">
            <div>
              <h2 className="font-semibold text-lg">Grading Schemes</h2>
              <p className="text-sm text-muted-foreground">Select a scheme to view and edit its bands, or create a new one.</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 items-end border-b pb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Active Scheme</label>
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={activeSchemeId} onChange={(e) => setSelectedSchemeId(e.target.value)}>
                  <option value="" disabled>Select a scheme</option>
                  {schemes.map(s => <option key={s.id} value={s.id}>{s.name} {policy?.gradingSchemeId === s.id ? '(Current Policy)' : ''}</option>)}
                </select>
              </div>
              <div>
                <Button onClick={handleSavePolicy} variant="outline" disabled={activeSchemeId === policy?.gradingSchemeId || !activeSchemeId}>
                  Set as Policy Active Scheme
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="font-medium mb-2">Create New Scheme</h3>
              <form onSubmit={handleCreateScheme} className="flex gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-xs">Name</label>
                  <Input className="h-8" value={newSchemeName} onChange={e => setNewSchemeName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">Description</label>
                  <Input className="h-8" value={newSchemeDesc} onChange={e => setNewSchemeDesc(e.target.value)} required />
                </div>
                <Button size="sm" type="submit" disabled={createScheme.isPending}>Create</Button>
              </form>
            </div>

            {activeSchemeId && (
              <SchemeBandsEditor schemeId={activeSchemeId} />
            )}
          </section>

          {/* Categories Section */}
          <section className="space-y-3 rounded-lg border bg-card p-4">
            <div>
              <h2 className="font-semibold text-lg">Assessment categories</h2>
              <p className="mt-1 text-sm text-muted-foreground">Categories are school-specific and can be added as your assessment program evolves.</p>
            </div>
            {referencesQuery.isLoading ? <LoadingSpinner /> : (
              <ul className="flex flex-wrap gap-2">
                {referencesQuery.data?.categories.filter((category) => category.isActive).map((category) => (
                  <li key={category.id} className="rounded-full border px-3 py-1 text-sm">{category.name}</li>
                ))}
              </ul>
            )}
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { 
              event.preventDefault(); 
              createCategory.mutate(categoryName, { 
                onSuccess: (category) => { setCategoryName(""); toast.success(`${category.name} category added.`); }, 
                onError: (error) => toast.error(error.message || "Unable to add category.") 
              }); 
            }}>
              <label className="sr-only" htmlFor="new-assessment-category">New category name</label>
              <Input id="new-assessment-category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Project" maxLength={60} />
              <Button type="submit" variant="outline" disabled={createCategory.isPending || categoryName.trim().length < 2}>
                {createCategory.isPending ? "Adding…" : "Add category"}
              </Button>
            </form>
            {createCategory.isError && <p role="alert" className="text-sm text-destructive">{createCategory.error.message}</p>}
          </section>
        </div>
      )}
    </PageShell>
  );
}
