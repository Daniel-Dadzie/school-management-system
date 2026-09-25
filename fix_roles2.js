const fs = require("fs");
const path = require("path");

function processDir(dir, roleStr) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath, roleStr);
        } else if (file === "page.tsx") {
            let content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("allowedRoles={[\"SUPER_ADMIN\", \"ADMIN\"]}")) {
                content = content.replace("allowedRoles={[\"SUPER_ADMIN\", \"ADMIN\"]}", roleStr);
                fs.writeFileSync(fullPath, content, "utf8");
                console.log("Updated to " + roleStr + " in " + fullPath);
            }
        }
    }
}

const parentRoles = "allowedRoles={[\"PARENT\"]}";
const parentDirs = ["parent-academics", "parent-admissions", "parent-announcements", "parent-children", "parent-notifications", "parent-profile", "results"];
const root = "apps/web/app/(portal)";

for (const d of parentDirs) {
    processDir(path.join(root, d), parentRoles);
}

