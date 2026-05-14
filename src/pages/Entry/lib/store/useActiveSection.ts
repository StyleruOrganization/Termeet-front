import { create } from "zustand";

// Стор для активного таба в хедере, делаю стор так как в entry уже много было ref на section
type ActiveSection = "features" | "advantages" | "team" | null;
interface ILoginModalStore {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

export const useActiveSectionStore = create<ILoginModalStore>(set => ({
  activeSection: null,
  setActiveSection: section => set({ activeSection: section }),
}));
