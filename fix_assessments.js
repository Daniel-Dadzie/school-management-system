const fs = require("fs");
let c = fs.readFileSync("apps/web/app/(portal)/assessments/new/page.tsx", "utf8");
c = c.replace(/<input type="text" className="w-full border p-2 rounded" \/>/g, "<select className=\"w-full border p-2 rounded\"><option value=\"\">Select...</option></select>");
fs.writeFileSync("apps/web/app/(portal)/assessments/new/page.tsx", c);
console.log("Fixed");

