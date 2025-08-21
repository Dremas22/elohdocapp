import { create } from "zustand";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (userDoc) => {
    // If no userDoc is provided, reset the user and stop loading
    if (!userDoc || !userDoc.userId) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      // Map userId to id
      set({
        currentUser: { id: userDoc.userId, ...userDoc },
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
