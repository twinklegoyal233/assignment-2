import { create } from "zustand";
interface ModalState {
    isAddCategoryOpen: boolean;
    openAddCategory: () => void;
    closeAddCategory: () => void;
  }

  export const useModalStore = create<ModalState>((set) => ({
    isAddCategoryOpen: false,
    openAddCategory: () => set({ isAddCategoryOpen: true }),
    closeAddCategory: () => set({ isAddCategoryOpen: false }),
  }));