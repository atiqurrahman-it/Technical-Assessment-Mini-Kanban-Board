import { LayoutDashboard, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Rendered for any unmatched route, or wherever `notFound()` is called. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <SearchX className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Button render={<Link href="/boards" />}>
        <LayoutDashboard className="h-4 w-4" /> Back to your boards
      </Button>
    </div>
  );
}
