"use client";

import { useStudents } from "@/lib/api/students";
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
import { Loader2, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function StudentsTable() {
  const [search, setSearch] = useState("");
  
  const { data: students, isLoading, isError } = useStudents();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading students...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-destructive">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium text-center">Failed to load students</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredStudents = students?.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  }) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle>Students Directory</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            description={search ? "No students match your search criteria." : "No students have been added to the system yet."}
            icon={Users}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment ID</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.enrollmentId || "N/A"}</TableCell>
                    <TableCell>{student.dateOfBirth}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/students/${student.id}`}>View</Link>
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
