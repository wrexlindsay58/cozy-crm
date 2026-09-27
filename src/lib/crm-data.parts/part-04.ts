import { conversations } from "./part-02";

export const unreadConversations = conversations.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0);
