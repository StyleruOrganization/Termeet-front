import { create } from "zustand";

interface ILoginModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLoginModalStore = create<ILoginModalStore>(set => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
