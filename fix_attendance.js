const fs = require("fs");
function addRoles(file, roles) {
    let c = fs.readFileSync(file, "utf8");
    if (!c.includes("allowedRoles")) {
        c = c.replace(/<PageShell([^>]+)>/, `<PageShell$1 ${roles}>`);
        fs.writeFileSync(file, c, "utf8");
        console.log("Updated " + file);
    }
}
const r = "allowedRoles={[\"SUPER_ADMIN\", \"ADMIN\", \"TEACHER\"]}";
addRoles("apps/web/app/(portal)/attendance/take/page.tsx", r);
addRoles("apps/web/app/(portal)/attendance/history/page.tsx", r);
addRoles("apps/web/app/(portal)/attendance/students/page.tsx", r);
addRoles("apps/web/app/(portal)/attendance/students/[studentId]/page.tsx", r);
addRoles("apps/web/app/(portal)/academic-setup/page.tsx", "allowedRoles={[\"SUPER_ADMIN\", \"ADMIN\"]}");

