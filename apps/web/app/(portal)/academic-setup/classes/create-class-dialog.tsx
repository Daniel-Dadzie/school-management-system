"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { useCreateSchoolClass } from "@/lib/api/academic";

const formSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  capacity: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateClassDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createClass, isPending } = useCreateSchoolClass();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: "",
      capacity: "30",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createClass({
        name: data.name,
        level: data.level,
        capacity: data.capacity && data.capacity !== "" ? parseInt(data.capacity, 10) : undefined,
      });
      toast.success("Class created successfully");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create class. Please try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Class</SheetTitle>
          <SheetDescription>
            Add a new class to the school system.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g. Grade 10A"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Grade Level</Label>
            <Input
              id="level"
              placeholder="e.g. Grade 10"
              {...register("level")}
              aria-invalid={!!errors.level}
            />
            {errors.level && (
              <p className="text-xs text-destructive">{errors.level.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              {...register("capacity")}
              aria-invalid={!!errors.capacity}
            />
            {errors.capacity && (
              <p className="text-xs text-destructive">
                {errors.capacity.message}
              </p>
            )}
          </div>
          <div className="flex justify-end pt-6 space-x-2 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Create Class
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
