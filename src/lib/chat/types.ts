export type ChatMessageSender = "customer" | "admin" | "system";

export type ChatMessage = {
  id: string;
  orderId: string;
  sender: ChatMessageSender;
  senderId?: string; // userId ou discordId
  senderName: string;
  content: string;
  isAutoMessage?: boolean;
  createdAt: string;
};

export type ChatThread = {
  orderId: string;
  status: "open" | "closed";
  lastMessageAt: string;
  messages: ChatMessage[];
};