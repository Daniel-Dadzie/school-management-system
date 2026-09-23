"use client";

import { useState } from "react";
import { Sparkles, Building, Check, Save, Undo } from "lucide-react";
import { toast } from "sonner";

import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ThemePreset {
  name: string;
  primaryHsl: string; // H S% L%
  hex: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { name: "CarePoint Indigo (Default)", primaryHsl: "221.2 83.2% 53.3%", hex: "#2563eb" },
  { name: "Emerald Green", primaryHsl: "142.1 76.2% 36.3%", hex: "#16a34a" },
  { name: "Royal Purple", primaryHsl: "262.1 83.3% 57.8%", hex: "#7c3aed" },
  { name: "Deep Navy", primaryHsl: "217.2 91.2% 59.8%", hex: "#1e40af" },
  { name: "Crimson Red", primaryHsl: "0 72.2% 50.6%", hex: "#dc2626" },
  { name: "Teal Ocean", primaryHsl: "174.7 83.9% 31.6%", hex: "#0f766e" },
];

export default function SettingsPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>(THEME_PRESETS[0].name);

  // School profile state
  const [schoolName, setSchoolName] = useState("CarePoint Community School");
  const [schoolMotto, setSchoolMotto] = useState("Knowledge, Character, and Community");
  const [contactEmail, setContactEmail] = useState("admin@carepoint.org");
  const [contactPhone, setContactPhone] = useState("+233 (0) 24 123 4567");
  const [schoolAddress, setSchoolAddress] = useState("12 Community Way, Accra, Ghana");

  const applyTheme = (preset: ThemePreset) => {
    setSelectedPreset(preset.name);
    // Dynamically apply to root CSS variable as mandated by Section 20
    document.documentElement.style.setProperty("--primary", preset.primaryHsl);
  };

  const handleSaveBranding = () => {
    toast.success("School branding and theme configuration updated successfully!");
  };

  const handleResetTheme = () => {
    applyTheme(THEME_PRESETS[0]);
    toast.info("Theme reset to default CarePoint Indigo.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("School profile details saved successfully!");
  };

  return (
    <PageShell
      title="Settings & Institution Branding"
      description="Configure institution profile, runtime theme tokens, and portal appearance."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Settings" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* School Profile Information */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Building className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Institution Profile</span>
                </div>
                <CardTitle className="text-lg">School Information</CardTitle>
                <CardDescription className="text-xs">
                  Official identity details displayed on student reports, admissions, and communications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-motto">School Motto / Slogan</Label>
                  <Input
                    id="school-motto"
                    value={schoolMotto}
                    onChange={(e) => setSchoolMotto(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Official Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input
                      id="contact-phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-address">Physical Campus Address</Label>
                  <Input
                    id="school-address"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Runtime Branding Customizer */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Appearance</span>
              </div>
              <CardTitle className="text-lg">Runtime School Branding</CardTitle>
              <CardDescription className="text-xs">
                Theme tokens update across all pages instantly without code recompilation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-foreground mb-3 block">
                  Select Brand Color Palette
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyTheme(preset)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className="text-[11px] text-center truncate max-w-full">
                          {preset.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Block */}
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Token Preview
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Primary Action</Button>
                  <Button size="sm" variant="outline">Secondary</Button>
                  <Badge>Active Status</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Active Palette: <span className="font-semibold text-foreground">{selectedPreset}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTheme}
                className="gap-1.5 text-xs"
              >
                <Undo className="h-3.5 w-3.5" />
                <span>Reset Default</span>
              </Button>
              <Button size="sm" onClick={handleSaveBranding} className="gap-1.5">
                <Save className="h-4 w-4" />
                <span>Save Theme</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
