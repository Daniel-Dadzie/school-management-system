"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  getPlatformSchools,
  provisionPlatformSchool,
  type PlatformSchool,
  type ProvisionPlatformSchoolRequest,
} from "@/lib/api/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";

export function SuperAdminSchools() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: schools, isLoading } = useQuery<PlatformSchool[]>({
    queryKey: ["platform-schools"],
    queryFn: getPlatformSchools,
  });

  const { register, handleSubmit, reset } = useForm<ProvisionPlatformSchoolRequest>({
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      timezone: "Africa/Accra",
      administratorUsername: "",
      administratorEmail: "",
      temporaryPassword: "",
    },
  });

  const provisionMutation = useMutation({
    mutationFn: provisionPlatformSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-schools"] });
      reset();
      setErrorMessage("");
      setSuccessMessage("School tenant and IT Admin provisioned successfully.");
      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccessMessage("");
      }, 2000);
    },
    onError: () => {
      setErrorMessage("Unable to provision the school. Check the details and try again.");
      setSuccessMessage("");
    },
  });

  function onSubmit(values: ProvisionPlatformSchoolRequest) {
    setErrorMessage("");
    provisionMutation.mutate(values);
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Active Tenants</h2>
          <p className="text-sm text-muted-foreground">
            Manage all schools hosted on the Karatu SIS platform.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if(!open) { setErrorMessage(""); setSuccessMessage(""); reset(); }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Provision School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Provision New School Tenant</DialogTitle>
              <DialogDescription>
                Create a new school tenant and its initial IT Administrator account.
              </DialogDescription>
            </DialogHeader>

            {errorMessage && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{errorMessage}</div>}
            {successMessage && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{successMessage}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">School Profile</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">School Name *</label>
                    <Input placeholder="e.g. CarePoint Academy" {...register("name", { required: true })} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Tenant Slug (Subdomain) *</label>
                    <Input placeholder="e.g. carepoint" {...register("slug", { required: true })} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Contact Email</label>
                    <Input placeholder="info@school.edu" {...register("email")} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Contact Phone</label>
                    <Input placeholder="+1234567890" {...register("phone")} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">IT Administrator</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Admin Username *</label>
                    <Input placeholder="admin.school" {...register("administratorUsername", { required: true })} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Admin Email *</label>
                    <Input type="email" placeholder="admin@school.edu" {...register("administratorEmail", { required: true })} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Temporary Password *</label>
                    <Input type="password" {...register("temporaryPassword", { required: true })} />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={provisionMutation.isPending}>
                  {provisionMutation.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Provision Tenant
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No schools found.
                </TableCell>
              </TableRow>
            ) : (
              schools?.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">{school.slug}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{school.email || "No email"}</span>
                      <span className="text-muted-foreground text-xs">{school.phone || "No phone"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {school.active ? (
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                        <XCircle className="mr-1 h-3 w-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(school.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
