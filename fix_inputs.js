const fs = require("fs");

function fixInputs(file) {
    let c = fs.readFileSync(file, "utf8");
    c = c.replace(/<input type="text" placeholder="Term ID"([^>]+)>/g, "<select $1><option value=\"\">Select Term</option></select>");
    c = c.replace(/<input type="text" placeholder="Class ID"([^>]+)>/g, "<select $1><option value=\"\">Select Class</option></select>");
    c = c.replace(/<input type="text" placeholder="Subject ID"([^>]+)>/g, "<select $1><option value=\"\">Select Subject</option></select>");
    fs.writeFileSync(file, c);
    console.log("Fixed inputs in " + file);
}

fixInputs("apps/web/app/(portal)/attendance/take/page.tsx");
fixInputs("apps/web/app/(portal)/attendance/history/page.tsx");

