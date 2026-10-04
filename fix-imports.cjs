const fs = require('fs');
let file = 'apps/web/app/(portal)/academic-setup/create-dialogs.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original import might still be there:
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

content = content.replace(/import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@\/components\/ui\/dialog";/,
"import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from \"@/components/ui/dialog\";\nimport { Button } from \"@/components/ui/button\";\nimport { Input } from \"@/components/ui/input\";\nimport { Label } from \"@/components/ui/label\";\nimport { Plus } from \"lucide-react\";");

fs.writeFileSync(file, content);
console.log('Fixed imports in create-dialogs');
