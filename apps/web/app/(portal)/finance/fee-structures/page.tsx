"use client";

import Link from 'next/link';
import { useState } from 'react';

import PageShell from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ForbiddenState } from '@/components/ui/forbidden-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCreateFeeStructure, useFinanceReferences } from '@/hooks/use-finance';
import { AuthorizationError, permissions } from '@/lib/authorization/permissions';

export default function FeeStructuresPage() {
  const query = useFinanceReferences();
  const create = useCreateFeeStructure();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [term, setTerm] = useState('');
  const [schoolClass, setSchoolClass] = useState('');
  const [items, setItems] = useState([{ name: '', amount: '' }]);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      await create.mutateAsync({
        name,
        academicYearId: year,
        termId: term,
        schoolClassId: schoolClass,
        items: items.map((item) => ({
          name: item.name,
          amountMinor: Math.round(Number(item.amount) * 100),
        })),
      });

      setName('');
      setItems([{ name: '', amount: '' }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save fee structure.');
    }
  }

  if (query.isLoading) {
    return (
      <PageShell
        title="Fee structures"
        description="Configure reusable fees for an academic year, term, and class."
        permission={permissions.financeManage}
        actions={
          <Button asChild variant="outline">
            <Link href="/finance">Back to finance</Link>
          </Button>
        }
      >
        <div role="status" className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  if (query.error instanceof AuthorizationError) {
    return (
      <PageShell
        title="Fee structures"
        description="Configure reusable fees for an academic year, term, and class."
        permission={permissions.financeManage}
        actions={
          <Button asChild variant="outline">
            <Link href="/finance">Back to finance</Link>
          </Button>
        }
      >
        <ForbiddenState
          title="Fee structure access denied"
          description="You do not have permission to manage fee structures."
          backLink="/finance"
        />
      </PageShell>
    );
  }

  if (query.isError) {
    return (
      <PageShell
        title="Fee structures"
        description="Configure reusable fees for an academic year, term, and class."
        permission={permissions.financeManage}
        actions={
          <Button asChild variant="outline">
            <Link href="/finance">Back to finance</Link>
          </Button>
        }
      >
        <ErrorState
          title="Unable to load fee structure options"
          description="Refresh to try again."
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  if (!query.data) {
    return (
      <PageShell
        title="Fee structures"
        description="Configure reusable fees for an academic year, term, and class."
        permission={permissions.financeManage}
        actions={
          <Button asChild variant="outline">
            <Link href="/finance">Back to finance</Link>
          </Button>
        }
      >
        <EmptyState
          title="Reference data unavailable"
          description="Academic years, terms, and classes could not be loaded."
          action={
            <Button asChild variant="outline">
              <Link href="/finance">Back to finance</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Fee structures"
      description="Configure reusable fees for an academic year, term, and class."
      permission={permissions.financeManage}
      actions={
        <Button asChild variant="outline">
          <Link href="/finance">Back to finance</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Create fee structure</h2>

          <label className="block space-y-1 text-sm">
            Structure name
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              Academic year
              <select
                required
                className="h-9 w-full rounded-md border bg-background px-3"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setTerm('');
                  setSchoolClass('');
                }}
              >
                <option value="">Select year</option>
                {query.data.years.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              Term
              <select
                required
                className="h-9 w-full rounded-md border bg-background px-3"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option value="">Select term</option>
                {query.data.terms
                  .filter((row) => row.academicYearId === year)
                  .map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block space-y-1 text-sm sm:col-span-2">
              Class
              <select
                required
                className="h-9 w-full rounded-md border bg-background px-3"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
              >
                <option value="">Select class</option>
                {query.data.classes
                  .filter((row) => row.academicYearId === year)
                  .map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Fee items</h3>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_8rem_auto] gap-2">
                <label className="sr-only" htmlFor={`fee-name-${index}`}>
                  Fee item name
                </label>
                <Input
                  id={`fee-name-${index}`}
                  value={item.name}
                  onChange={(e) =>
                    setItems((current) =>
                      current.map((entry, idx) =>
                        idx === index ? { ...entry, name: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="Tuition"
                />

                <label className="sr-only" htmlFor={`fee-amount-${index}`}>
                  Amount
                </label>
                <Input
                  id={`fee-amount-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) =>
                    setItems((current) =>
                      current.map((entry, idx) =>
                        idx === index ? { ...entry, amount: e.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="200"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setItems((current) =>
                      current.length > 1 ? current.filter((_, idx) => idx !== index) : current,
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => setItems((current) => [...current, { name: '', amount: '' }])}
            >
              Add fee item
            </Button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save structure'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4 rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Reference data</h2>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 p-4">
                <h3 className="text-sm font-medium">Academic years</h3>
                {query.data.years.length ? (
                  <ul className="space-y-1 text-sm">
                    {query.data.years.map((row) => (
                      <li key={row.id}>{row.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No academic years found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <h3 className="text-sm font-medium">Terms</h3>
                {query.data.terms.length ? (
                  <ul className="space-y-1 text-sm">
                    {query.data.terms.map((row) => (
                      <li key={row.id}>{row.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No terms found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <h3 className="text-sm font-medium">Classes</h3>
                {query.data.classes.length ? (
                  <ul className="space-y-1 text-sm">
                    {query.data.classes.map((row) => (
                      <li key={row.id}>{row.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No classes found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
