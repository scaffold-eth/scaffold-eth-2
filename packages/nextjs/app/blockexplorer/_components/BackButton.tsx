"use client";

import { useRouter } from "next/navigation";
import { Button } from "~~/components/Button";

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant="primary" size="sm" onClick={() => router.back()}>
      Back
    </Button>
  );
};
