import type { Order } from "./types";

export function deliveryLabel(order: Order): string {
  if (order.adminStatus === "APROVADO") return "Entregue";
  if (order.adminStatus === "REJEITADO") return "Recusado";
  if (order.status === "FALHA" || order.status === "CANCELADO") {
    return "Falhou";
  }
  if (order.status === "COMPLETO") return "Em entrega";
  if (order.status === "PENDENTE") return "Pendente";
  return "Em andamento";
}

export function statusTone(
  order: Order,
): "pending" | "approved" | "rejected" | "paid" | "failed" {
  if (order.adminStatus === "APROVADO") return "approved";
  if (order.adminStatus === "REJEITADO") return "rejected";
  if (order.status === "FALHA" || order.status === "CANCELADO") return "failed";
  if (order.status === "COMPLETO") return "paid";
  return "pending";
}

export function isPendingOrder(order: Order): boolean {
  if (order.adminStatus === "APROVADO" || order.adminStatus === "REJEITADO") {
    return false;
  }
  if (order.status === "FALHA" || order.status === "CANCELADO") return false;
  return (
    order.status === "PENDENTE" ||
    (order.status === "COMPLETO" && order.adminStatus === "AGUARDANDO")
  );
}

export function isPaidLike(order: Order): boolean {
  return order.status === "COMPLETO" || order.adminStatus === "APROVADO";
}
