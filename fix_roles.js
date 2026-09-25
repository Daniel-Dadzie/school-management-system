const fs = require("fs");
const path = require("path");

const adminRoles = "allowedRoles={[\"SUPER_ADMIN\", \"ADMIN\"]}";
const adminDirs = ["academic-setup", "admissions-admin", "assessments", "enrollments", "students", "users", "settings", "system-status"];
const root = "apps/web/app/(portal)";

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file === "page.tsx") {
            let content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("<PageShell") && !content.includes("allowedRoles")) {
                content = content.replace(/<PageShell([^>]+)>/, `<PageShell$1 ${adminRoles}>`);
                fs.writeFileSync(fullPath, content, "utf8");
                console.log("Updated " + fullPath);
            }
        }
    }
}

for (const d of adminDirs) {
    processDir(path.join(root, d));
}

// Parent Routes
const parentRoles = "allowedRoles={[\"PARENT\"]}";
const parentDirs = ["parent-academics", "parent-admissions", "parent-announcements", "parent-children", "parent-notifications", "parent-profile", "results"];
for (const d of parentDirs) {
    processDir(path.join(root, d));
}

