const fs = require("fs");
const file = "apps/web/lib/functional/storage/database.ts";
let c = fs.readFileSync(file, "utf8");

// 1. Bump version
c = c.replace("const CURRENT_VERSION = 6;", "const CURRENT_VERSION = 7;");

// 2. Update hasBaseStoreShape to include new collections
c = c.replace(
  "Array.isArray(data.notifications) &&",
  "Array.isArray(data.notifications) && Array.isArray(data.incidents) && Array.isArray(data.calendarEvents) &&"
);

// 3. Add seed data — insert BEFORE "notifications: [" 
const seedInsert = `  incidents: [
    { id: "inc-1", tenantId: "tenant-1", title: "Classroom Disruption", description: "Student repeatedly disrupted class during mathematics lesson.", category: "BEHAVIOUR", severity: "LOW", status: "RESOLVED", studentId: "1", reportedBy: "3", actionTaken: "Verbal warning issued. Parent notified.", resolvedBy: "3", resolvedAt: new Date(Date.now() - 86400000 * 5).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "inc-2", tenantId: "tenant-1", title: "Alleged Bullying Incident", description: "A student reported being bullied during lunch break. Under investigation.", category: "BULLYING", severity: "HIGH", status: "INVESTIGATING", studentId: "2", reportedBy: "3", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "inc-3", tenantId: "tenant-1", title: "Cheating on Assessment", description: "Student found copying answers during end-of-term science assessment.", category: "ACADEMIC_DISHONESTY", severity: "MEDIUM", status: "CLOSED", studentId: "1", reportedBy: "3", actionTaken: "Assessment score voided. Suspension for 1 day.", resolvedBy: "2", resolvedAt: new Date(Date.now() - 86400000 * 10).toISOString(), createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "inc-4", tenantId: "tenant-1", title: "Property Damage", description: "Student accidentally broke a classroom window during break time.", category: "PROPERTY_DAMAGE", severity: "MEDIUM", status: "OPEN", studentId: "2", reportedBy: "4", createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  calendarEvents: [
    { id: "evt-1", tenantId: "tenant-1", title: "Term 1 Begins", type: "OTHER", startDate: "2026-09-01", endDate: "2026-09-01", allDay: true, createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-2", tenantId: "tenant-1", title: "Independence Day Holiday", type: "HOLIDAY", startDate: "2026-09-21", endDate: "2026-09-21", allDay: true, description: "National holiday - no classes.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-3", tenantId: "tenant-1", title: "Mid-Term Examinations", type: "EXAM", startDate: "2026-10-05", endDate: "2026-10-09", allDay: true, description: "All classes. Exam timetable distributed separately.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-4", tenantId: "tenant-1", title: "Parent-Teacher Conference", type: "MEETING", startDate: "2026-10-15", endDate: "2026-10-15", allDay: false, location: "School Hall", description: "All parents are invited.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-5", tenantId: "tenant-1", title: "Annual Sports Day", type: "SPORTS", startDate: "2026-11-08", endDate: "2026-11-08", allDay: true, location: "Sports Field", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-6", tenantId: "tenant-1", title: "Cultural Day and Prize Giving", type: "CULTURAL", startDate: "2026-11-20", endDate: "2026-11-20", allDay: true, location: "Main Hall", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-7", tenantId: "tenant-1", title: "End of Term 1", type: "OTHER", startDate: "2026-11-28", endDate: "2026-11-28", allDay: true, createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
`;

c = c.replace("  notifications: [", seedInsert + "  notifications: [");

// 4. Add migration fallback
c = c.replace(
  "        notifications: Array.isArray(data.notifications) ? data.notifications : seeds.notifications,",
  "        notifications: Array.isArray(data.notifications) ? data.notifications : seeds.notifications,\n        incidents: Array.isArray(data.incidents) ? data.incidents : seeds.incidents,\n        calendarEvents: Array.isArray(data.calendarEvents) ? data.calendarEvents : seeds.calendarEvents,"
);

fs.writeFileSync(file, c);
console.log("db done");
