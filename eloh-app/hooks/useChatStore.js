import { create } from "zustand";
import { useUserStore } from "./useUserStore";

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
