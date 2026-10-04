"use client";

import { useState } from "react";
import { useSaveReportCardComments } from "@/hooks/use-assessments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit } from "lucide-react";

export function EditReportCardComments({
  studentId,
  academicYearId,
  termId,
  initialClassTeacherComment,
  initialHeadTeacherComment,
  canEditHeadTeacherComment = false,
}: {
  studentId: string;
  academicYearId: string;
  termId: string;
  initialClassTeacherComment?: string;
  initialHeadTeacherComment?: string;
  canEditHeadTeacherComment?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [classComment, setClassComment] = useState(initialClassTeacherComment || "");
  const [headComment, setHeadComment] = useState(initialHeadTeacherComment || "");
  const saveComments = useSaveReportCardComments();

  const handleSave = async () => {
    try {
      await saveComments.mutateAsync({
        studentId,
        academicYearId,
        termId,
        classTeacherComment: classComment,
        headTeacherComment: headComment,
      });
      toast.success("Comments saved successfully");
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save comments");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" /> Edit Comments
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Report Card Comments</DialogTitle>
          <DialogDescription>
            Enter the comments that will appear on the printed report card.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="class-comment" className="text-sm font-medium">Class Teacher&apos;s Comment</label>
            <Textarea
              id="class-comment"
              placeholder="Enter class teacher&apos;s comment..."
              value={classComment}
              onChange={(e) => setClassComment(e.target.value)}
              className="h-24 resize-none"
            />
          </div>
          {canEditHeadTeacherComment && (
            <div className="space-y-2">
              <label htmlFor="head-comment" className="text-sm font-medium">Principal&apos;s / Head&apos;s Comment</label>
              <Textarea
                id="head-comment"
                placeholder="Enter principal&apos;s comment..."
                value={headComment}
                onChange={(e) => setHeadComment(e.target.value)}
                className="h-24 resize-none"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saveComments.isPending}>
            {saveComments.isPending ? "Saving..." : "Save Comments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
