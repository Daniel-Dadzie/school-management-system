"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { AcademicAdapter } from "@/lib/functional/adapters/academic-adapter";
import { GradeBandRecord } from "@/lib/functional/types";
import { useAssessmentReferences, useCreateAssessmentCategory, useGradeScales, useSaveGradeScale } from "@/hooks/use-assessments";
import { useQuery } from "@tanstack/react-query";
import { permissions } from "@/lib/authorization/permissions";

export default function GradingConfigurationPage() {
  const yearsQuery = useQuery({ queryKey: ["academic-years"], queryFn: () => AcademicAdapter.getAcademicYears() });
  const scalesQuery = useGradeScales();
  const referencesQuery = useAssessmentReferences();
  const saveScale = useSaveGradeScale();
  const createCategory = useCreateAssessmentCategory();
  const years = useMemo(() => yearsQuery.data ?? [], [yearsQuery.data]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const yearId = years.some((year) => year.id === selectedYearId) ? selectedYearId : years[0]?.id ?? "";
  const scale = scalesQuery.data?.find((item) => item.academicYearId === yearId && item.isActive);
  const template = scalesQuery.data?.[0];
  const yearName = years.find((year) => year.id === yearId)?.name ?? "";
  const initialBands = (scale?.bands ?? template?.bands ?? []).map((band) => ({ ...band, id: scale ? band.id : `band-${yearId}-${band.sortOrder}` }));
  const [draft, setDraft] = useState<{ yearId: string; name: string; bands: GradeBandRecord[] }>({ yearId: "", name: "", bands: [] });
  const [categoryName, setCategoryName] = useState("");
  const editor = draft.yearId === yearId ? draft : { yearId, name: scale?.name ?? (yearName ? `${yearName} grading scale` : ""), bands: initialBands };

  const updateBand = (index: number, field: keyof GradeBandRecord, value: string) => {
    setDraft((current) => ({ ...editor, bands: editor.bands.map((band, i) => i !== index ? band : {
      ...band,
      [field]: field === "grade" || field === "remark" ? value : value === "" ? 0 : Number(value),
    }) }));
  };

  const onSave = () => {
    if (!yearId || !editor.name.trim()) { toast.error("Choose an academic year and enter a scale name."); return; }
    saveScale.mutate({ id: scale?.id, academicYearId: yearId, name: editor.name, isActive: true, bands: editor.bands }, {
      onSuccess: () => { setDraft({ yearId: "", name: "", bands: [] }); toast.success("Grading scale saved."); },
      onError: (error) => toast.error(error.message || "Unable to save grading scale."),
    });
  };

  return <PageShell title="Grading scale" description="Configure grade bands for an academic year. Bands must cover 0–100% without gaps or overlaps." breadcrumbs={[{ label: "Academics", href: "/academic-setup" }, { label: "Grading scale" }]} permission={permissions.academicsManage}>
    {yearsQuery.isLoading || scalesQuery.isLoading || referencesQuery.isLoading ? <div className="flex min-h-40 items-center justify-center"><LoadingSpinner /></div> : yearsQuery.isError || scalesQuery.isError || referencesQuery.isError ? <p role="alert" className="rounded-md border border-destructive p-4 text-sm">Unable to load grading configuration.</p> : !years.length ? <p className="rounded-md border p-4 text-sm">Create an academic year before configuring grades.</p> : <div className="max-w-4xl space-y-5">
      <section className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="grading-year" className="text-sm font-medium">Academic year</label><select id="grading-year" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={yearId} onChange={(event) => { setSelectedYearId(event.target.value); setDraft({ yearId: "", name: "", bands: [] }); }}>{years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></div>
        <div className="space-y-2"><label htmlFor="grading-name" className="text-sm font-medium">Scale name</label><Input id="grading-name" value={editor.name} onChange={(event) => setDraft({ ...editor, name: event.target.value })} maxLength={100} /></div>
      </section>
      {!editor.bands.length ? <p className="rounded-md border p-4 text-sm">No grade-band template exists. Add a scale in the mock seed before configuring this year.</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[680px] text-sm"><thead className="bg-muted/50 text-left"><tr>{["Grade", "Minimum %", "Maximum %", "Grade point", "Remark"].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}</tr></thead><tbody>{editor.bands.map((band, index) => <tr key={band.id} className="border-t"><td className="px-3 py-2"><Input aria-label={`Grade ${index + 1}`} value={band.grade} onChange={(event) => updateBand(index, "grade", event.target.value)} /></td><td className="px-3 py-2"><Input aria-label={`${band.grade} minimum percentage`} type="number" min="0" max="100" step="0.01" value={band.minimumPercentage} onChange={(event) => updateBand(index, "minimumPercentage", event.target.value)} /></td><td className="px-3 py-2"><Input aria-label={`${band.grade} maximum percentage`} type="number" min="0" max="100" step="0.01" value={band.maximumPercentage} onChange={(event) => updateBand(index, "maximumPercentage", event.target.value)} /></td><td className="px-3 py-2"><Input aria-label={`${band.grade} grade point`} type="number" min="0" step="0.01" value={band.gradePoint ?? ""} onChange={(event) => updateBand(index, "gradePoint", event.target.value)} /></td><td className="px-3 py-2"><Input aria-label={`${band.grade} remark`} value={band.remark} onChange={(event) => updateBand(index, "remark", event.target.value)} /></td></tr>)}</tbody></table></div>}
      <div className="flex justify-end"><Button onClick={onSave} disabled={saveScale.isPending || editor.bands.length === 0}>{saveScale.isPending ? "Saving…" : "Save grading scale"}</Button></div>
      <section className="space-y-3 rounded-lg border bg-card p-4"><div><h2 className="font-semibold">Assessment categories</h2><p className="mt-1 text-sm text-muted-foreground">Categories are school-specific and can be added as your assessment program evolves.</p></div><ul className="flex flex-wrap gap-2">{referencesQuery.data?.categories.filter((category) => category.isActive).map((category) => <li key={category.id} className="rounded-full border px-3 py-1 text-sm">{category.name}</li>)}</ul><form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); createCategory.mutate(categoryName, { onSuccess: (category) => { setCategoryName(""); toast.success(`${category.name} category added.`); }, onError: (error) => toast.error(error.message || "Unable to add category.") }); }}><label className="sr-only" htmlFor="new-assessment-category">New category name</label><Input id="new-assessment-category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Project" maxLength={60} /><Button type="submit" variant="outline" disabled={createCategory.isPending || categoryName.trim().length < 2}>{createCategory.isPending ? "Adding…" : "Add category"}</Button></form>{createCategory.isError && <p role="alert" className="text-sm text-destructive">{createCategory.error.message}</p>}</section>
    </div>}
  </PageShell>;
}
