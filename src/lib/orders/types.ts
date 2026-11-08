export type OrderStatus = "PENDENTE" | "COMPLETO" | "FALHA" | "CANCELADO";

export type AdminStatus = "AGUARDANDO" | "APROVADO" | "REJEITADO";

export type OrderType = "robux" | "gamepass" | "custom_gamepass";

export type Order = {
  id: string;
  type: OrderType;
  productLabel: string;
  amountBrl: number;
  robuxAmount?: number;
  gamepassId?: string;
  /** Pedido personalizado — nome do jogo Roblox */
  customGameName?: string;
  /** Pedido personalizado — nome da gamepass */
  customGamepassName?: string;
  robloxGamepassId?: number;
  robloxUserId?: number;
  robloxUsername: string;
  /** Conta Hollow logada que criou o pedido (nunca confundir com nick Roblox). */
  accountUserId?: string;
  /**
   * Segredo de visualização do pedido (checkout). Necessário para consultar
   * status/PIX sem sessão — nunca listar em APIs públicas de dashboard.
   */
  viewToken?: string;
  payerName: string;
  payerDocument: string;
  status: OrderStatus;
  adminStatus: AdminStatus;
  transactionId?: string;
  copyPaste?: string;
  qrCodeBase64?: string;
  qrcodeUrl?: string;
  discordMessageId?: string;
  discordChannelId?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
};
