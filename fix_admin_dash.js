const fs = require("fs");
let c = fs.readFileSync("apps/web/components/portal/dashboards/admin-dashboard.tsx", "utf8");
c = c.replace("/admissions/applications?status=PENDING&size=5", "/admissions");
fs.writeFileSync("apps/web/components/portal/dashboards/admin-dashboard.tsx", c);
console.log("Fixed dashboard");

