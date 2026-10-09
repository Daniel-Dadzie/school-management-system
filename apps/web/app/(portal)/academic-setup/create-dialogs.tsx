/* eslint-disable @typescript-eslint/ban-ts-comment */
 
 
 
// @ts-nocheck
"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

function DialogFrame({
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button><Plus aria-hidden="true" />{title}</Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} required value={value} onChange={(event) => onChange(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <option value="">Select {label.toLowerCase()}</option>
        {children}
      </select>
    </div>
  );
}

export function CreateYearDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const createYear = useCreateAcademicYear();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createYear.mutateAsync({ name: name.trim(), startDate, endDate });
      toast.success("Academic year created successfully.");
      setName(""); setStartDate(""); setEndDate(""); setOpen(false);
    } catch {
      toast.error("Unable to create the academic year. Check the dates and try again.");
    }
  };

  return (
    <DialogFrame title="Add Academic Year" description="Create an academic year with its start and end dates." open={open} onOpenChange={setOpen}>
      <form onSubmit={submit} className="space-y-4">
        <Field id="year-name" label="Name" value={name} onChange={setName} />
        <Field id="year-start" label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <Field id="year-end" label="End date" type="date" value={endDate} onChange={setEndDate} />
        <div className="flex justify-end"><Button type="submit" disabled={createYear.isPending}>{createYear.isPending ? "Creating..." : "Create Academic Year"}</Button></div>
      </form>
    </DialogFrame>
  );
}

export function CreateTermDialog() {
  const [open, setOpen] = useState(false);
  const [academicYearId, setAcademicYearId] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const { data: years } = useAcademicYears();
  const createTerm = useCreateTerm(academicYearId);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createTerm.mutateAsync({ name: name.trim(), startDate, endDate, isMandatory });
      toast.success("Term created successfully.");
      setAcademicYearId(""); setName(""); setStartDate(""); setEndDate(""); setIsMandatory(true); setOpen(false);
    } catch {
      toast.error("Unable to create the term. Check the dates and academic year.");
    }
  };

  return (
    <DialogFrame title="Add Term" description="Create a term within an academic year." open={open} onOpenChange={setOpen}>
      <form onSubmit={submit} className="space-y-4">
        <SelectField id="term-year" label="Academic year" value={academicYearId} onChange={setAcademicYearId}>
          {(years ?? []).map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
        </SelectField>
        <Field id="term-name" label="Name" value={name} onChange={setName} />
        <Field id="term-start" label="Start date" type="date" value={startDate} onChange={setStartDate} />
        <Field id="term-end" label="End date" type="date" value={endDate} onChange={setEndDate} />
        <label htmlFor="term-mandatory" className="flex items-center gap-2 text-sm"><input id="term-mandatory" type="checkbox" checked={isMandatory} onChange={(event) => setIsMandatory(event.target.checked)} />Mandatory term</label>
        <div className="flex justify-end"><Button type="submit" disabled={createTerm.isPending || !academicYearId}>{createTerm.isPending ? "Creating..." : "Create Term"}</Button></div>
      </form>
    </DialogFrame>
  );
}

export function CreateSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");
  const createSubject = useCreateSubject();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createSubject.mutateAsync({ name: name.trim(), code: code.trim(), department: department.trim() || undefined });
      toast.success("Subject created successfully.");
      setName(""); setCode(""); setDepartment(""); setOpen(false);
    } catch {
      toast.error("Unable to create the subject. Check its name and code.");
    }
  };

  return (
    <DialogFrame title="Add Subject" description="Add a subject to the school curriculum." open={open} onOpenChange={setOpen}>
      <form onSubmit={submit} className="space-y-4">
        <Field id="subject-name" label="Name" value={name} onChange={setName} />
        <Field id="subject-code" label="Code" value={code} onChange={setCode} />
        <Field id="subject-department" label="Department" value={department} onChange={setDepartment} required={false} />
        <div className="flex justify-end"><Button type="submit" disabled={createSubject.isPending}>{createSubject.isPending ? "Creating..." : "Create Subject"}</Button></div>
      </form>
    </DialogFrame>
  );
}

export function CreateAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const teacherOptions = useAcademicTeacherOptions();
  const { data: years } = useAcademicYears();
  const { data: classes } = useSchoolClasses();
  const { data: subjects } = useSubjects();
  const { data: terms } = useTerms(academicYearId);
  const createAssignment = useCreateTeacherAssignment();
  const teachers = teacherOptions.data ?? [];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createAssignment.mutateAsync({ teacherId, academicYearId, termId, schoolClassId, subjectId });
      toast.success("Teacher assignment created successfully.");
      setTeacherId(""); setAcademicYearId(""); setTermId(""); setSchoolClassId(""); setSubjectId(""); setOpen(false);
    } catch {
      toast.error("Unable to create the assignment. Check the selected teacher and academic records.");
    }
  };

  return (
    <DialogFrame title="Add Assignment" description="Assign a teacher to a class and subject for a term." open={open} onOpenChange={setOpen}>
      {teacherOptions.isError ? (
        <p role="status" className="text-sm text-muted-foreground">Teacher selection is unavailable in API mode because a teacher-directory API is not available.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <SelectField id="assignment-teacher" label="Teacher" value={teacherId} onChange={setTeacherId}>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}
          </SelectField>
          <SelectField id="assignment-year" label="Academic year" value={academicYearId} onChange={(value) => { setAcademicYearId(value); setTermId(""); }}>
            {(years ?? []).map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
          </SelectField>
          <SelectField id="assignment-term" label="Term" value={termId} onChange={setTermId}>
            {(terms ?? []).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </SelectField>
          <SelectField id="assignment-class" label="Class" value={schoolClassId} onChange={setSchoolClassId}>
            {(classes ?? []).map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
          </SelectField>
          <SelectField id="assignment-subject" label="Subject" value={subjectId} onChange={setSubjectId}>
            {(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </SelectField>
          <div className="flex justify-end"><Button type="submit" disabled={createAssignment.isPending || !teachers.length || !termId || !schoolClassId || !subjectId}>{createAssignment.isPending ? "Creating..." : "Create Assignment"}</Button></div>
        </form>
      )}
    </DialogFrame>
  );
}

