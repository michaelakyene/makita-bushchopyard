// src/lib/whatsapp/client.ts
import { RESTAURANT_CONFIG } from "@/lib/constants";

export function openWhatsAppWithMessage(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  // ✅ Uses the central phone number
  window.open(
    `https://wa.me/${RESTAURANT_CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`,
    "_blank",
  );
}

export function generateOrderMessage(order: any): string {
  const items = order.items
    .map(
      (item: any) =>
        `${item.quantity}x ${item.name} - ${RESTAURANT_CONFIG.CURRENCY}${(item.price * item.quantity).toFixed(2)}`,
    )
    .join("\n");

  return `🆕 *New Order!* 🍽️

📋 *Order #${order.id.slice(0, 8).toUpperCase()}*
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone || "N/A"}
📍 *Delivery:* ${order.deliveryMethod}
${order.deliveryAddress ? `🏠 *Address:* ${order.deliveryAddress}` : ""}

📦 *Items:*
${items}

💰 *Total:* ${RESTAURANT_CONFIG.CURRENCY}${order.total.toFixed(2)}
💳 *Payment:* ${order.paymentMethod}

📝 *Instructions:* ${order.specialInstructions || "None"}

✅ *Order placed at:* ${new Date().toLocaleString()}

📱 *Restaurant:* ${RESTAURANT_CONFIG.BUSINESS_NAME}`;
}

export function sendOrderToWhatsApp(order: any): void {
  const message = generateOrderMessage(order);
  openWhatsAppWithMessage(message);
}
