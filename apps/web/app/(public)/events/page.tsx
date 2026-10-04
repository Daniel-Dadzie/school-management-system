import { Metadata } from "next";
import { Calendar, Clock, MapPin, Users, Trophy, Music, BookOpen, Microscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Events | CarePoint Community School",
  description: "Upcoming and past school events at CarePoint Community School in Anaji, Takoradi.",
};

const upcomingEvents = [
  {
    title: "2026/2027 Admission Open Day",
    date: "October 18, 2026",
    time: "9:00 AM – 1:00 PM",
    location: "CarePoint School Main Hall",
    category: "Admissions",
    description:
      "Meet our teachers, tour our facilities, and learn about the admission process for the new academic year. All prospective parents and guardians are warmly invited.",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Inter-School Science & Maths Quiz",
    date: "November 5, 2026",
    time: "8:00 AM – 3:00 PM",
    location: "CarePoint School Multipurpose Hall",
    category: "Academic",
    description:
      "Our JHS students compete against regional schools in a rigorous Science and Mathematics quiz. Come cheer on our young scholars as they demonstrate academic excellence.",
    icon: Microscope,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Annual Prize-Giving & Graduation Ceremony",
    date: "December 12, 2026",
    time: "10:00 AM – 2:00 PM",
    location: "CarePoint School Grounds",
    category: "Ceremony",
    description:
      "Celebrating the achievements of our graduating JHS 3 class and outstanding students across all levels. A proud milestone for our entire school community.",
    icon: Trophy,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    title: "Cultural Arts & Heritage Festival",
    date: "January 23, 2027",
    time: "9:00 AM – 4:00 PM",
    location: "School Compound",
    category: "Culture",
    description:
      "Students showcase Ghana's rich cultural heritage through music, dance, drama, and traditional craft exhibitions. A vibrant celebration of identity and creativity.",
    icon: Music,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Parent-Teacher Conference — Term 2",
    date: "February 14, 2027",
    time: "8:00 AM – 12:00 PM",
    location: "Classrooms",
    category: "Parent Engagement",
    description:
      "An opportunity for parents and guardians to meet with class teachers to review academic progress, discuss individual student needs, and strengthen the home-school partnership.",
    icon: BookOpen,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Annual Sports Day",
    date: "March 6, 2027",
    time: "7:30 AM – 5:00 PM",
    location: "CarePoint School Sports Field",
    category: "Sports",
    description:
      "A full day of athletic competitions, team relay races, and friendly rivalry between our school houses. Students, parents, and staff come together to celebrate physical health and team spirit.",
    icon: Trophy,
    color: "bg-red-500/10 text-red-600",
  },
];

const categoryColors: Record<string, string> = {
  Admissions: "bg-blue-100 text-blue-700",
  Academic: "bg-green-100 text-green-700",
  Ceremony: "bg-yellow-100 text-yellow-700",
  Culture: "bg-purple-100 text-purple-700",
  "Parent Engagement": "bg-orange-100 text-orange-700",
  Sports: "bg-red-100 text-red-700",
};

export default function EventsPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b py-20">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071')",

          }}
        />
        <div className="absolute inset-0 z-0 bg-white/80 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl drop-shadow-sm">
            School Events
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700 font-medium">
            Stay up to date with ceremonies, competitions, cultural festivals, and
            parent engagement sessions at CarePoint Community School.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Upcoming Events — 2026/2027</h2>
          <p className="mt-2 text-muted-foreground">
            Mark your calendar and join us for these important school events.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => {
            const Icon = event.icon;
            return (
              <Card key={event.title} className="shadow-xs flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${event.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-medium ${categoryColors[event.category] ?? ""}`}
                    >
                      {event.category}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-lg leading-snug">{event.title}</CardTitle>
                  <CardDescription className="text-sm">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="space-y-1.5 border-t pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notice */}
        <div className="mt-14 rounded-xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Event dates and times are subject to change. Follow school notices for the latest
            updates, or contact our administration at{" "}
            <a
              href="mailto:info@carepointschool.edu.gh"
              className="font-medium text-primary hover:underline"
            >
              info@carepointschool.edu.gh
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
