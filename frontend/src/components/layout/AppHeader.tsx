"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";

/** App-wide top bar. `children` is a slot for page-specific context (e.g. the board name/actions). */
export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/boards" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Kanban
          </Link>
          {children}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          {user && <UserAvatar name={user.name} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmingSignOut(true)}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingSignOut}
        onOpenChange={setConfirmingSignOut}
        title="Log out?"
        description="You'll need to sign in again to access your boards."
        confirmLabel="Log out"
        onConfirm={() => {
          setConfirmingSignOut(false);
          signOut();
        }}
      />
    </header>
  );
}
