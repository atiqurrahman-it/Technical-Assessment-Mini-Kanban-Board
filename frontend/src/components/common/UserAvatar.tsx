import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** Renders a person's initial(s) in a colored circle — used everywhere we show "who". */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarFallback>{initials || "?"}</AvatarFallback>
    </Avatar>
  );
}
