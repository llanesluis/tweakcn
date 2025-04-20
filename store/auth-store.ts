import { create } from "zustand";

interface AuthStore {
  isOpen: boolean;
  mode: "signin" | "signup";
  openAuthDialog: (mode?: "signin" | "signup") => void;
  closeAuthDialog: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  mode: "signin",
  openAuthDialog: (newMode?: "signin" | "signup") => {
    set((state) => ({
      isOpen: true,
      mode: newMode || state.mode,
    }));
  },
  closeAuthDialog: () => {
    set({ isOpen: false });
  },
}));
