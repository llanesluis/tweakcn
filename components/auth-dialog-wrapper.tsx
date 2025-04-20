"use client";

import { AuthDialog } from "@/app/(auth)/components/auth-dialog";
import { useAuthStore } from "@/store/auth-store";

export function AuthDialogWrapper() {
  const { isOpen, mode, closeAuthDialog } = useAuthStore();

  return (
    <AuthDialog
      open={isOpen}
      onOpenChange={closeAuthDialog}
      initialMode={mode}
    />
  );
}
