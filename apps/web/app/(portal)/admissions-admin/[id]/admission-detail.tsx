"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admissionsApi, AdmissionStatus } from "@/lib/api/admissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export function AdmissionDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: app, isLoading, isError } = useQuery({
    queryKey: ["admissions", id],
    queryFn: () => admissionsApi.getApplication(id),
  });

  const mutation = useMutation({
    mutationFn: (status: AdmissionStatus) => admissionsApi.updateStatus(id, { status }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.setQueryData(["admissions", id], data);
      if (data.status === "APPROVED") {
        toast.success("Application accepted successfully.");
      } else if (data.status === "REJECTED") {
        toast.success("Application rejected successfully.");
      }
    },
    onError: (err: unknown) => {
      const e = err as Record<string, unknown>;
      if (e?.status === 409 || e?.status === 400) {
        toast.error("This application has already been updated. Refresh the page to view its current status.");
      } else {
        toast.error((e?.message as string) || "Failed to update status.");
      }
    },
    onSettled: () => {
      setIsAccepting(false);
      setIsRejecting(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading application details...</p>
      </div>
    );
  }

  if (isError || !app) {
    return (
      <EmptyState
        title="Application not found"
        description="This admission application could not be found or has been removed."
        action={<Button asChild><Link href="/admissions-admin">Back to Admissions</Link></Button>}
      />
    );
  }

  const handleAccept = () => {
    if (confirm("Accept this admission application?\n\nConfirm that you want to mark this application as accepted. Note: This does not automatically create an enrollment.")) {
      setIsAccepting(true);
      mutation.mutate("APPROVED");
    }
  };

  const handleReject = () => {
    if (confirm("Reject this admission application?\n\nConfirm that you want to mark this application as rejected. This is a terminal state.")) {
      setIsRejecting(true);
      mutation.mutate("REJECTED");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="secondary">Under Review</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isTerminal = app.status === "APPROVED" || app.status === "REJECTED";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{app.studentFirstName} {app.studentLastName}</h2>
          <p className="text-muted-foreground">Application #{app.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(app.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{app.studentFirstName} {app.studentLastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{app.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{app.gender}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Parent/Guardian Name</p>
              <p className="font-medium">{app.parentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium">{app.relationship}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{app.parentEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{app.parentPhone}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Applying for Class</p>
              <p className="font-medium">{app.applyingForClass}</p>
            </div>
            {app.additionalNotes && (
              <div>
                <p className="text-sm text-muted-foreground">Additional Notes</p>
                <p className="font-medium whitespace-pre-wrap">{app.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {isTerminal ? (
              <p className="text-muted-foreground">
                This application has reached a terminal state ({app.status}) and cannot be modified further.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleAccept} 
                  disabled={isAccepting || isRejecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAccepting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Accept Admission
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting}
                  variant="destructive"
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reject Admission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
