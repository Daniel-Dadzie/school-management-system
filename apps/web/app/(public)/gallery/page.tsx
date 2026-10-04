import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | CarePoint Community School",
  description: "A visual journey through life at CarePoint Community School — classrooms, events, sports, and school activities.",
};

const galleryCategories = [
  {
    label: "Classroom Learning",
    description: "Students engaged in active, hands-on learning across all year groups.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800",
        alt: "Students working together on a science experiment in class",
      },
      {
        src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800",
        alt: "Teacher explaining a concept at the whiteboard to primary students",
      },
      {
        src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",
        alt: "Young learners reading books in the school library",
      },
    ],
  },
  {
    label: "Sports & Physical Education",
    description: "Healthy bodies and competitive spirit on the field and court.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=800",
        alt: "Students running relay race on Sports Day",
      },
      {
        src: "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=800",
        alt: "Football match between school house teams",
      },
      {
        src: "https://images.unsplash.com/photo-1519744346361-7a029b427a59?q=80&w=800",
        alt: "Students cheering on teammates at the annual athletics event",
      },
    ],
  },
  {
    label: "Ceremonies & Graduations",
    description: "Marking milestones and celebrating academic achievement together.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=800",
        alt: "JHS graduation ceremony with students in caps and gowns",
      },
      {
        src: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=800",
        alt: "Prize-giving day with students receiving awards on stage",
      },
      {
        src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800",
        alt: "School principal addressing students and parents at assembly",
      },
    ],
  },
  {
    label: "Cultural Arts & Heritage",
    description: "Celebrating Ghanaian culture through performance, dance, and visual arts.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800",
        alt: "Students performing traditional Ghanaian dance at the cultural festival",
      },
      {
        src: "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=800",
        alt: "Children displaying handmade craft and art projects at the showcase",
      },
      {
        src: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=800",
        alt: "School choir performing at the end of term programme",
      },
    ],
  },
];

export default function GalleryPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b py-20">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=800')",

          }}
        />
        <div className="absolute inset-0 z-0 bg-white/80 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl drop-shadow-sm">
            School Gallery
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700 font-medium">
            A visual celebration of life at CarePoint Community School — from classroom
            discoveries to sporting triumphs and cultural milestones.
          </p>
        </div>
      </div>

      {/* Gallery Categories */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        {galleryCategories.map((category) => (
          <section key={category.label}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{category.label}</h2>
              <p className="mt-1 text-muted-foreground">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {category.images.map((img) => (
                <div
                  key={img.src}
                  className="group overflow-hidden rounded-xl border bg-muted shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="px-3 py-2 text-xs text-muted-foreground leading-snug">
                    {img.alt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Photo submission note */}
        <div className="rounded-xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Do you have photos from a school event you&apos;d like to share?{" "}
            <a
              href="/contact"
              className="font-medium text-primary hover:underline"
            >
              Contact our administration
            </a>{" "}
            to submit them for inclusion in the gallery.
          </p>
        </div>
      </div>
    </div>
  );
}
