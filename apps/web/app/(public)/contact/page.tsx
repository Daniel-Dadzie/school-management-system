import { Metadata } from "next";
import { MapPin, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Us | CarePoint Community School",
  description: "Contact information for CarePoint Community School in Anaji, Takoradi.",
};

export default function ContactPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="bg-muted/20 border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We look forward to hearing from you. Get in touch with our administration or admissions team for any inquiries.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-xs border">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground text-sm">
                CarePoint Community School<br />
                Anaji, Takoradi<br />
                Ghana
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-xs border">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm">
                Administrative Office<br />
                Available Monday - Friday<br />
                8:00 AM - 4:00 PM
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-xs border">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm">
                General Inquiries:<br />
                info@carepoint.example.com<br />
                <br />
                Admissions:<br />
                admissions@carepoint.example.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

