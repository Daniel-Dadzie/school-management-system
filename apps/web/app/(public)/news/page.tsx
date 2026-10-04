import { Metadata } from "next";
import { Calendar, ArrowRight, BookOpen, Award, Users, Megaphone } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "News & Announcements | CarePoint Community School",
  description: "Latest news, academic updates, and school announcements from CarePoint Community School.",
};

const newsArticles = [
  {
    id: 1,
    category: "Academic Achievement",
    categoryColor: "bg-green-100 text-green-700",
    icon: Award,
    iconColor: "bg-green-500/10 text-green-600",
    title: "CarePoint Students Excel in Regional Mathematics Olympiad",
    date: "September 28, 2026",
    summary:
      "Three of our JHS 3 students placed in the top five of this year's Western Region Mathematics Olympiad, held in Takoradi. Abena Mensah secured first place, while Kweku Asante and Ama Boateng earned second and fourth respectively. We are incredibly proud of their dedication and the tireless support of our mathematics department.",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800",
    imageAlt: "Students celebrating with math olympiad trophies",
  },
  {
    id: 2,
    category: "School Announcement",
    categoryColor: "bg-blue-100 text-blue-700",
    icon: Megaphone,
    iconColor: "bg-blue-500/10 text-blue-600",
    title: "Admissions Now Open for the 2026/2027 Academic Year",
    date: "September 15, 2026",
    summary:
      "CarePoint Community School is officially accepting applications for Nursery, Kindergarten, Primary, and Junior High School (JHS 1) for the 2026/2027 academic year. Interested parents and guardians are encouraged to visit our admissions page or stop by the school office between 8:00 AM and 3:00 PM on weekdays. Places are limited — apply early to secure your child's spot.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800",
    imageAlt: "School administration office welcoming families",
  },
  {
    id: 3,
    category: "Community",
    categoryColor: "bg-purple-100 text-purple-700",
    icon: Users,
    iconColor: "bg-purple-500/10 text-purple-600",
    title: "Parent-Teacher Forum Strengthens Home-School Partnership",
    date: "September 5, 2026",
    summary:
      "Over 120 parents attended our Term 1 Parent-Teacher Forum held on the school grounds. The event provided an open platform for parents to engage directly with subject teachers and school leadership. Discussions covered academic performance trends, co-curricular activities, and the school's development plans for the 2026/2027 academic year. The turnout reflects the strong community support that makes CarePoint exceptional.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800",
    imageAlt: "Parents and teachers meeting in a school hall",
  },
  {
    id: 4,
    category: "Academic",
    categoryColor: "bg-orange-100 text-orange-700",
    icon: BookOpen,
    iconColor: "bg-orange-500/10 text-orange-600",
    title: "New STEM Laboratory Officially Commissioned",
    date: "August 25, 2026",
    summary:
      "CarePoint Community School officially commissioned its new STEM laboratory ahead of the 2026/2027 academic year. The facility is equipped with modern science apparatus, digital microscopes, and basic coding workstations. The lab will be integrated into the Primary and JHS science and ICT curriculum, giving students practical, hands-on exposure to Science, Technology, Engineering, and Mathematics from an early age.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800",
    imageAlt: "Students working in a modern school science laboratory",
  },
  {
    id: 5,
    category: "School Announcement",
    categoryColor: "bg-blue-100 text-blue-700",
    icon: Megaphone,
    iconColor: "bg-blue-500/10 text-blue-600",
    title: "2025 BECE Results: Outstanding Performance by Our JHS Graduates",
    date: "August 10, 2026",
    summary:
      "We are delighted to announce that our 2025 BECE cohort achieved an exceptional pass rate, with over 94% of students qualifying for Senior High School placement. Several students achieved aggregate scores placing them among the top performers in the Western Region. This outcome is a testament to the hard work of our students, the dedication of our teachers, and the unwavering support of our school community.",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=800",
    imageAlt: "Graduating students celebrating BECE results",
  },
  {
    id: 6,
    category: "Community",
    categoryColor: "bg-purple-100 text-purple-700",
    icon: Users,
    iconColor: "bg-purple-500/10 text-purple-600",
    title: "CarePoint Launches School Garden Programme",
    date: "July 18, 2026",
    summary:
      "As part of our commitment to environmental education and practical learning, CarePoint has launched a school garden programme. Students from Primary 3 through JHS 2 will cultivate vegetable beds and herb plots as part of integrated science and life skills lessons. The programme promotes responsibility, environmental stewardship, and the joy of growing food — values central to our holistic educational philosophy.",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800",
    imageAlt: "Students planting seedlings in the school garden",
  },
];

export default function NewsPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b py-20">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800')",

          }}
        />
        <div className="absolute inset-0 z-0 bg-white/80 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl drop-shadow-sm">
            News &amp; Announcements
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700 font-medium">
            The latest updates, achievements, and important announcements from CarePoint
            Community School.
          </p>
        </div>
      </div>

      {/* News Articles */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">Latest Stories</h2>
          <p className="mt-2 text-muted-foreground">
            Celebrating achievements, sharing updates, and keeping our community informed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Featured Article — full width */}
          {newsArticles.slice(0, 1).map((article) => {
            const Icon = article.icon;
            return (
              <article
                key={article.id}
                className="lg:col-span-2 overflow-hidden rounded-xl border bg-card shadow-xs flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt={article.imageAlt}
                    className="h-60 w-full md:h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${article.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className={`text-[11px] ${article.categoryColor}`}>
                      {article.category}
                    </Badge>
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-snug">{article.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {article.summary}
                  </p>
                </div>
              </article>
            );
          })}

          {/* Remaining articles */}
          {newsArticles.slice(1).map((article) => {
            const Icon = article.icon;
            return (
              <article
                key={article.id}
                className="overflow-hidden rounded-xl border bg-card shadow-xs flex flex-col"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${article.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className={`text-[11px] ${article.categoryColor}`}>
                      {article.category}
                    </Badge>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">{article.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border bg-muted/30 p-6">
          <div>
            <h3 className="font-semibold text-foreground">Want to stay informed?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Contact us to be added to our parent communication list.
            </p>
          </div>
          <Button asChild variant="default">
            <Link href="/contact" className="gap-2">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
