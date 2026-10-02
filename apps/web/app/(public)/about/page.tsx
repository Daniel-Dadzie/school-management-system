import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | CarePoint Community School",
  description: "Learn about CarePoint Community School's history, mission, and values in Anaji, Takoradi.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="bg-muted/20 border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            About CarePoint
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Established in 2013 in Anaji, Takoradi, we are dedicated to raising learners who uphold Godliness, Excellence, and Ghana at heart.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our History</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2013, CarePoint Community School began with a vision to provide accessible, high-quality basic education to the Anaji community and its environs in Takoradi, Ghana. 
              </p>
              <p>
                Over the years, we have grown from a modest nursery and kindergarten into a full-fledged basic educational institution comprising Early Childhood, Primary, and Junior High School levels, consistently delivering on our promise of academic rigor and character formation.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                To provide an enriching, inclusive educational experience grounded in academic rigor, ethical leadership, and dedicated community support. We believe that true education balances intellectual curiosity with emotional and spiritual well-being.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Godliness:</strong> Fostering spiritual growth and moral integrity.</li>
                <li><strong>Excellence:</strong> Pursuing the highest standards in academics and extracurriculars.</li>
                <li><strong>Patriotism:</strong> Cultivating a deep love for and commitment to Ghana.</li>
                <li><strong>Community:</strong> Building strong partnerships with families and the local community.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

