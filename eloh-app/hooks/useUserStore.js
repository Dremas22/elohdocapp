import { create } from "zustand";

/**
 * Zustand store for managing the authenticated user's state.
 *
 * State:
 * - `currentUser`: The currently logged-in user object, or `null` if none.
 * - `isLoading`: Indicates whether user data is being loaded.
 *
 * Actions:
 * - `fetchUserInfo(userDoc)`: Asynchronously updates the store with user data.
 *    - If `userDoc` is missing or has no `userId`, resets `currentUser` to null.
 *    - Otherwise, sets `currentUser` with the provided data, spreading all fields
 *      from `userDoc` and ensuring `id` is mapped from `userDoc.userId`.
 *    - Always sets `isLoading` to `false` once finished.
 *
 * Notes:
 * - Error handling is included: if something fails during fetch, the store
 *   resets `currentUser` to `null` and sets `isLoading` to `false`.
 */
export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (userDoc) => {
    if (!userDoc || !userDoc.userId) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
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
