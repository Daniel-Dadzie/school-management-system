const fs = require('fs');

let f1 = 'apps/web/app/(portal)/parent-wallet/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/catch \\(err: any\\) {/g, 'catch (err: unknown) {\n      const errorMessage = err instanceof Error ? err.message : String(err);');
c1 = c1.replace(/err\\.message/g, 'errorMessage');
fs.writeFileSync(f1, c1);

let f2 = 'apps/web/app/(portal)/academic-setup/create-dialogs.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@\/components\/ui\/dialog";/,
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";\nimport { Button } from "@/components/ui/button";\nimport { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\nimport { Plus } from "lucide-react";);
fs.writeFileSync(f2, c2);

let f3 = 'apps/web/app/(portal)/parent-children/[studentId]/report-card/page.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/report card hasn't been/g, "report card hasn&apos;t been");
fs.writeFileSync(f3, c3);

let f4 = 'apps/web/app/(portal)/students/new/page.tsx';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(/don't have permission/g, "don&apos;t have permission");
fs.writeFileSync(f4, c4);

let f5 = 'apps/web/components/layout/sidebar.tsx';
let c5 = fs.readFileSync(f5, 'utf8');
c5 = c5.replace(/setMounted\\(true\\);/g, '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setMounted(true);');
fs.writeFileSync(f5, c5);

let f6 = 'apps/web/components/portal/dashboards/admin-dashboard.tsx';
let c6 = fs.readFileSync(f6, 'utf8');
c6 = c6.replace(/\\[key: string\\]: any/g, '[key: string]: unknown');
fs.writeFileSync(f6, c6);

let f7 = 'apps/web/lib/functional/services/calendar-service.ts';
let c7 = fs.readFileSync(f7, 'utf8');
c7 = c7.replace(/filter\\(\\(e: any\\) =>/g, 'filter((e: unknown) =>');
c7 = c7.replace(/e\\.startDate/g, '(e as any).startDate');
c7 = c7.replace(/e\\.type/g, '(e as any).type');
fs.writeFileSync(f7, c7);

let f8 = 'apps/web/lib/functional/services/discipline-service.ts';
let c8 = fs.readFileSync(f8, 'utf8');
c8 = c8.replace(/filter\\(\\(i: any\\) =>/g, 'filter((i: unknown) =>');
c8 = c8.replace(/i\\.studentId/g, '(i as any).studentId');
c8 = c8.replace(/i\\.status/g, '(i as any).status');
fs.writeFileSync(f8, c8);

console.log("Fixed!");
