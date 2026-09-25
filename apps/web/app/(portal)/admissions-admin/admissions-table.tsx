"use client";

import { useQuery } from "@tanstack/react-query";
import { admissionsApi } from "@/lib/api/admissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Loader2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AdmissionsTable() {
  const [search, setSearch] = useState("");
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admissions"],
    queryFn: admissionsApi.getApplications,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading applications...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load applications"
        description="We couldn't load admission applications right now."
        action={<Button onClick={() => refetch()}>Try Again</Button>}
      />
    );
  }

  const applications = data || [];
  
  const filtered = applications.filter((app) => 
    `${app.studentFirstName} ${app.studentLastName}`.toLowerCase().includes(search.toLowerCase()) ||
    app.applyingForClass.toLowerCase().includes(search.toLowerCase())
  );

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications"
        description="No admission applications have been submitted yet."
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="secondary">Under Review</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admission Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applicants..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No applications match your filters.</p>
            <Button variant="outline" onClick={() => setSearch("")}>Clear filters</Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.studentFirstName} {app.studentLastName}
                    </TableCell>
                    <TableCell>{app.applyingForClass}</TableCell>
                    <TableCell>
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admissions-admin/${app.id}`}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
