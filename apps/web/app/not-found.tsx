import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold tracking-tight text-primary mb-4">404</h2>
      <h3 className="text-xl font-semibold mb-2">Page Not Found</h3>
      <p className="text-muted-foreground mb-6">The page you are looking for does not exist or has been moved.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
