const fs = require("fs");
function replaceStr(file, search, replace) {
    let c = fs.readFileSync(file, "utf8");
    c = c.replace(search, replace);
    fs.writeFileSync(file, c);
}
replaceStr("apps/web/app/(portal)/assessments/[assessmentId]/results/page.tsx", "title=\"Page\"", "title=\"Assessment Results\"");
replaceStr("apps/web/app/(portal)/attendance/history/page.tsx", "title=\"Page\"", "title=\"Attendance History\"");
replaceStr("apps/web/app/(portal)/attendance/students/page.tsx", "title=\"Page\"", "title=\"Student Attendance\"");
replaceStr("apps/web/app/(portal)/attendance/students/[studentId]/page.tsx", "title=\"Page\"", "title=\"Student Attendance Details\"");
replaceStr("apps/web/app/(portal)/attendance/take/page.tsx", "title=\"Page\"", "title=\"Take Attendance\"");

let asm = fs.readFileSync("apps/web/app/(portal)/assessments/[assessmentId]/page.tsx", "utf8");
asm = asm.replace("title=\"Assessment {assessmentId}\"", "title={`Assessment ${assessmentId}`}");
fs.writeFileSync("apps/web/app/(portal)/assessments/[assessmentId]/page.tsx", asm);
console.log("Done");

