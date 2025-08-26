import { create } from "zustand";
import { useUserStore } from "./useUserStore";

/**
 * Zustand store for managing chat state between users.
 *
 * This store keeps track of:
 * - `chatId`: the currently active chat
 * - `user`: the chat partner (null if blocked or no active chat)
 * - `isCurrentUserBlocked`: true if the chat partner has blocked the current user
 * - `isReceiverBlocked`: true if the current user has blocked the partner
 *
 * Actions:
 * - `changeChat(chatId, user)`: Switch to a new chat. Handles blocked states automatically.
 * - `changeBlock()`: Toggle whether the current user has blocked the partner.
 * - `setChatId()`: Clear the current chat ID and partner without resetting block states.
 * - `resetChat()`: Reset all chat state back to initial defaults.
 * - `deleteChat(chatIdToDelete)`: If the deleted chat is the active one, reset state; otherwise no change.
 *
 * Notes:
 * - The store checks blocking logic by referencing `useUserStore`.
 * - If the partner has blocked the current user, the `user` field is set to null
 *   so the UI can hide or disable interactions.
 */
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (user && currentUser && user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (user && currentUser && currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      // Default case
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
  setChatId: () => {
    set({
      chatId: null,
      user: null,
    });
  },

  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
  deleteChat: (chatIdToDelete) => {
    set((state) => {
      // If the current chat is being deleted, reset it
      if (state.chatId === chatIdToDelete) {
        return {
          chatId: null,
          user: null,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
        };
      }
      return state; // otherwise leave state unchanged
    });
  },
}));
