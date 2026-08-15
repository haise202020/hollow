import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  type TextChannel,
} from "discord.js";
import {
  getOrder,
  updateOrderAdmin,
  updateOrderStatus,
} from "@/lib/orders/store";
import type { Order } from "@/lib/orders/types";
import { formatBrl } from "@/lib/data/catalog";

const globalDiscord = globalThis as typeof globalThis & {
  __hollowDiscordClient?: Client;
  __hollowDiscordStarting?: Promise<Client | null>;
  __hollowDiscordListenersAttached?: boolean;
};

function getToken() {
  return process.env.DISCORD_BOT_TOKEN?.trim() || "";
}

function getChannelId() {
  return process.env.DISCORD_ORDERS_CHANNEL_ID?.trim() || "";
}

function getDeliveryChannelId() {
  return (
    process.env.DISCORD_DELIVERY_CHANNEL_ID?.trim() ||
    "1535747383953199144"
  );
}

async function getTextChannel(
  client: Client,
  channelId: string,
): Promise<TextChannel | null> {
  if (!channelId) return null;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return null;
  return channel as TextChannel;
}

function paymentColor(status: Order["status"]) {
  if (status === "COMPLETO") return 0x22c55e;
  if (status === "FALHA" || status === "CANCELADO") return 0xef4444;
  return 0x8b5cf6;
}

function adminLabel(status: Order["adminStatus"]) {
  if (status === "APROVADO") return "✅ Aprovado";
  if (status === "REJEITADO") return "❌ Rejeitado";
  return "⏳ Aguardando aprovação";
}

export function buildOrderEmbed(order: Order) {
  const fields = [
    { name: "Pedido", value: `\`${order.id}\``, inline: false },
    { name: "Usuário Roblox", value: `@${order.robloxUsername}`, inline: true },
    { name: "Produto", value: order.productLabel, inline: true },
    {
      name: "Valor",
      value: formatBrl(order.amountBrl),
      inline: true,
    },
    {
      name: "Pagamento",
      value: order.status,
      inline: true,
    },
    {
      name: "Admin",
      value: adminLabel(order.adminStatus),
      inline: true,
    },
  ];

  if (order.robloxGamepassId) {
    fields.push({
      name: "Gamepass ID",
      value: String(order.robloxGamepassId),
      inline: true,
    });
  }

  if (order.robuxAmount) {
    fields.push({
      name: "Robux líquidos",
      value: order.robuxAmount.toLocaleString("pt-BR"),
      inline: true,
    });
  }

  if (order.approvedBy) {
    fields.push({
      name: "Responsável",
      value: order.approvedBy,
      inline: true,
    });
  }

  return new EmbedBuilder()
    .setTitle("🛒 Carrinho Hollow")
    .setDescription("Novo pedido no site — revise e aprove a entrega.")
    .setColor(
      order.adminStatus === "APROVADO"
        ? 0x22c55e
        : order.adminStatus === "REJEITADO"
          ? 0xef4444
          : paymentColor(order.status),
    )
    .addFields(fields)
    .setFooter({ text: "Hollow Bux · painel de pedidos" })
    .setTimestamp(new Date(order.createdAt));
}

export function buildOrderButtons(order: Order) {
  const disabled = (order.adminStatus ?? "AGUARDANDO") !== "AGUARDANDO";

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`order_approve:${order.id}`)
      .setLabel("Aprovar")
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`order_reject:${order.id}`)
      .setLabel("Recusar")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),
  );
}

async function getOrdersChannel(client: Client): Promise<TextChannel | null> {
  return getTextChannel(client, getChannelId());
}

export function buildDeliveryEmbed(order: Order) {
  const fields = [
    { name: "Pedido", value: `\`${order.id}\``, inline: false },
    {
      name: "Nick Roblox",
      value: `@${order.robloxUsername}`,
      inline: true,
    },
    {
      name: "Roblox User ID",
      value: order.robloxUserId ? String(order.robloxUserId) : "—",
      inline: true,
    },
    { name: "Produto", value: order.productLabel, inline: true },
    { name: "Tipo", value: order.type === "robux" ? "Robux" : "Gamepass", inline: true },
    { name: "Valor pago", value: formatBrl(order.amountBrl), inline: true },
  ];

  if (order.robuxAmount) {
    fields.push({
      name: "Robux líquidos",
      value: order.robuxAmount.toLocaleString("pt-BR"),
      inline: true,
    });
  }

  if (order.robloxGamepassId) {
    fields.push({
      name: "Gamepass ID",
      value: String(order.robloxGamepassId),
      inline: true,
    });
    fields.push({
      name: "Link da gamepass",
      value: `[Abrir no Roblox](https://www.roblox.com/game-pass/${order.robloxGamepassId})`,
      inline: false,
    });
  }

  if (order.gamepassId) {
    fields.push({
      name: "Catalog ID",
      value: order.gamepassId,
      inline: true,
    });
  }

  if (order.approvedBy) {
    fields.push({
      name: "Aprovado por",
      value: order.approvedBy,
      inline: true,
    });
  }

  if (order.accountUserId) {
    fields.push({
      name: "Conta Hollow",
      value: `\`${order.accountUserId}\``,
      inline: true,
    });
  }

  return new EmbedBuilder()
    .setTitle("📦 Entrega liberada — Hollow")
    .setDescription(
      "Pedido aprovado. Envie a gamepass / Robux para o nick abaixo.",
    )
    .setColor(0x22c55e)
    .addFields(fields)
    .setFooter({ text: "Hollow Bux · canal de entregas" })
    .setTimestamp(new Date(order.approvedAt || order.updatedAt || order.createdAt));
}

export async function notifyDeliveryChannel(order: Order): Promise<void> {
  const client = await ensureDiscordBot();
  if (!client) return;

  const channel = await getTextChannel(client, getDeliveryChannelId());
  if (!channel) {
    console.warn("[discord] Canal de entregas não encontrado.");
    return;
  }

  await channel.send({
    content: `Entrega pra **@${order.robloxUsername}**`,
    embeds: [buildDeliveryEmbed(order)],
  });
}

export async function notifyOrderCreated(order: Order): Promise<void> {
  const client = await ensureDiscordBot();
  if (!client) return;

  const channel = await getOrdersChannel(client);
  if (!channel) {
    console.warn("[discord] Canal de pedidos não encontrado.");
    return;
  }

  const message = await channel.send({
    embeds: [buildOrderEmbed(order)],
    components: [buildOrderButtons(order)],
  });

  await updateOrderStatus(order.id, order.status, {
    discordMessageId: message.id,
    discordChannelId: channel.id,
  });
}

export async function refreshOrderDiscordMessage(order: Order): Promise<void> {
  const client = await ensureDiscordBot();
  if (!client || !order.discordMessageId || !order.discordChannelId) return;

  const channel = await client.channels
    .fetch(order.discordChannelId)
    .catch(() => null);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const message = await channel.messages
    .fetch(order.discordMessageId)
    .catch(() => null);
  if (!message) return;

  await message.edit({
    embeds: [buildOrderEmbed(order)],
    components: [buildOrderButtons(order)],
  });
}

function getStaffRoleIds(): string[] {
  return (process.env.DISCORD_STAFF_ROLE_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function handleOrderButton(
  customId: string,
  userTag: string,
  memberRoleIds: string[],
): Promise<{ ok: boolean; content: string }> {
  const staffRoles = getStaffRoleIds();
  if (staffRoles.length > 0) {
    const allowed = memberRoleIds.some((roleId) => staffRoles.includes(roleId));
    if (!allowed) {
      return {
        ok: false,
        content: "Sem permissão para aprovar/recusar pedidos.",
      };
    }
  }

  const [action, orderId] = customId.split(":");
  if (!orderId || (action !== "order_approve" && action !== "order_reject")) {
    return { ok: false, content: "Ação inválida." };
  }

  const order = await getOrder(orderId);
  if (!order) {
    return { ok: false, content: "Pedido não encontrado no banco." };
  }

  const currentAdmin = order.adminStatus ?? "AGUARDANDO";
  if (currentAdmin !== "AGUARDANDO") {
    return {
      ok: false,
      content: `Este pedido já foi tratado (${currentAdmin}).`,
    };
  }

  const adminStatus = action === "order_approve" ? "APROVADO" : "REJEITADO";
  const wasUnpaid = order.status !== "COMPLETO";

  const updated = await updateOrderAdmin(orderId, adminStatus, {
    approvedBy: userTag,
  });

  if (!updated) {
    return {
      ok: false,
      content: "Pedido já foi tratado por outra pessoa (ou falhou a atualização).",
    };
  }

  // Aprovação Discord também libera o pedido no site (PIX automático OU presente/manual).
  const finalized =
    adminStatus === "APROVADO"
      ? (await updateOrderStatus(orderId, "COMPLETO", {
          adminStatus: "APROVADO",
          approvedBy: userTag,
          approvedAt: updated.approvedAt,
        })) ?? updated
      : updated;

  console.log(
    `[discord] Pedido ${orderId} → ${adminStatus} por ${userTag}${
      adminStatus === "APROVADO" && wasUnpaid ? " (manual/presente)" : ""
    }`,
  );

  await refreshOrderDiscordMessage(finalized);

  if (adminStatus === "APROVADO") {
    try {
      await notifyDeliveryChannel(finalized);
    } catch (error) {
      console.error("[discord] Falha ao enviar no canal de entregas:", error);
    }
  }

  return {
    ok: true,
    content:
      adminStatus === "APROVADO"
        ? wasUnpaid
          ? `Pedido \`${orderId}\` aprovado manualmente por ${userTag} (sem PIX). Entrega enviada ao canal de delivery.`
          : `Pedido \`${orderId}\` aprovado por ${userTag}. Entrega enviada ao canal de delivery.`
        : `Pedido \`${orderId}\` recusado por ${userTag}.`,
  };
}

function attachListeners(client: Client) {
  if (globalDiscord.__hollowDiscordListenersAttached) return;
  globalDiscord.__hollowDiscordListenersAttached = true;

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("order_")) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const roles = interaction.member?.roles;
      const roleIds =
        roles && typeof roles === "object" && "cache" in roles
          ? [...roles.cache.keys()]
          : Array.isArray(roles)
            ? roles.map(String)
            : [];

      const result = await handleOrderButton(
        interaction.customId,
        interaction.user.username,
        roleIds,
      );
      await interaction.editReply({ content: result.content });
    } catch (error) {
      console.error("[discord] Erro ao processar botão:", error);
      await interaction.editReply({
        content: "Erro ao processar a aprovação. Tente novamente.",
      });
    }
  });
}

export async function ensureDiscordBot(): Promise<Client | null> {
  const token = getToken();
  if (!token) {
    console.warn("[discord] DISCORD_BOT_TOKEN ausente.");
    return null;
  }

  if (globalDiscord.__hollowDiscordClient?.isReady()) {
    return globalDiscord.__hollowDiscordClient;
  }

  if (globalDiscord.__hollowDiscordStarting) {
    return globalDiscord.__hollowDiscordStarting;
  }

  globalDiscord.__hollowDiscordStarting = (async () => {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds],
      partials: [Partials.Channel],
    });

    attachListeners(client);

    await client.login(token);
    await new Promise<void>((resolve) => {
      if (client.isReady()) {
        resolve();
        return;
      }
      client.once(Events.ClientReady, () => resolve());
    });

    globalDiscord.__hollowDiscordClient = client;
    console.log(`[discord] Bot conectado como ${client.user?.tag}`);
    return client;
  })().catch((error) => {
    console.error("[discord] Falha ao iniciar bot:", error);
    globalDiscord.__hollowDiscordStarting = undefined;
    return null;
  });

  return globalDiscord.__hollowDiscordStarting;
}

export async function startDiscordBot(): Promise<void> {
  await ensureDiscordBot();
}
