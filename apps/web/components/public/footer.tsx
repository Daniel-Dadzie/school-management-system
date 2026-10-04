import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                CarePoint Community School
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Raising learners who uphold Godliness, Excellence, and Ghana at heart. Nurturing Character, Inspiring Excellence.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/academics" className="hover:text-foreground transition-colors">Academics</Link></li>
              <li><Link href="/admissions" className="hover:text-foreground transition-colors">Admissions</Link></li>
              <li><Link href="/gallery" className="hover:text-foreground transition-colors">Gallery</Link></li>
              <li><Link href="/news" className="hover:text-foreground transition-colors">News</Link></li>
              <li><Link href="/events" className="hover:text-foreground transition-colors">Events</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Location
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Anaji, Takoradi, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; 2026 CarePoint Community School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
