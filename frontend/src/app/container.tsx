"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSpinner } from "@/components/ui/spinner";

/** Entry point — always redirects; `/boards` itself sends unauthenticated visitors to `/login`. */
export default function HomeContainer() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/boards");
  }, [router]);

  return <PageSpinner />;
}
