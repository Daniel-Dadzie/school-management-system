const fs = require('fs');
let file = 'apps/web/app/(portal)/academic-setup/create-dialogs.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";',
"import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from \"@/components/ui/sheet\";\nimport { Button } from \"@/components/ui/button\";\nimport { Input } from \"@/components/ui/input\";\nimport { Label } from \"@/components/ui/label\";\nimport { Plus } from \"lucide-react\";");

fs.writeFileSync(file, content);
console.log('Fixed imports!');
