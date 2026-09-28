"use client";

import { useUsers } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Loader2, Search, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const { data, isLoading, isError } = useUsers();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Users could not be loaded"
            description="Try refreshing the user list."
          />
        </CardContent>
      </Card>
    );
  }

  const users = data || [];
  
  const filtered = users.filter((user) =>
    `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.username} ${user.email}`.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === "ALL" || user.role === roleFilter) && (statusFilter === "ALL" || user.status === statusFilter)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search users"
              placeholder="Search users"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="grid gap-1 text-sm">Role<select aria-label="Filter by role" className="h-10 rounded-md border border-input bg-background px-3" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="ALL">All roles</option><option value="SUPER_ADMIN">Super admin</option><option value="ADMIN">Admin</option><option value="TEACHER">Teacher</option><option value="PARENT">Parent</option></select></label>
          <label className="grid gap-1 text-sm">Status<select aria-label="Filter by status" className="h-10 rounded-md border border-input bg-background px-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No users match your filters.</p>
            <Button variant="outline" onClick={() => setSearch("")}>Clear filters</Button>
          </div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {filtered.map((user) => <article key={user.id} className="rounded-md border p-4">
              <div className="font-medium">{user.firstName} {user.lastName}</div><p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm"><span>{user.role}</span><span>{user.status}</span></div>
              <div className="mt-3 flex gap-2"><Button variant="outline" size="sm" asChild><Link href={`/users/${user.id}`}>View</Link></Button><Button variant="outline" size="sm" asChild><Link href={`/users/${user.id}/edit`}>Edit</Link></Button></div>
            </article>)}
          </div>
          <div className="hidden rounded-md border md:block">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last login</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">{user.status}</td>
                    <td className="px-6 py-4">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/users/${user.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild><Link href={`/users/${user.id}/edit`}>Edit</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
