// src/lib/notifications/order-notification.ts
import { RESTAURANT_CONFIG } from "@/lib/constants";

export interface OrderData {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  paymentMethod: string;
  specialInstructions?: string | null;
  isGuest?: boolean;
}

export function generateWhatsAppMessage(order: OrderData): string {
  const itemsList = order.items
    .map(
      (item) =>
        `  • ${item.quantity}x ${item.name} - GH₵${(item.price * item.quantity).toFixed(2)}`,
    )
    .join("\n");

  return `🆕 *NEW ORDER!* 🍽️

📋 *Order #${order.id.slice(0, 8).toUpperCase()}*
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone || "N/A"}
📍 *Delivery:* ${order.deliveryMethod}
${order.deliveryAddress ? `🏠 *Address:* ${order.deliveryAddress}\n` : ""}
📦 *Items:*
${itemsList}

💰 *Total:* GH₵${order.total.toFixed(2)}
💳 *Payment:* ${order.paymentMethod}
${order.specialInstructions ? `\n📝 *Instructions:* ${order.specialInstructions}` : ""}

✅ *Order placed at:* ${new Date().toLocaleString()}

---
${RESTAURANT_CONFIG.BUSINESS_NAME}
📱 ${RESTAURANT_CONFIG.WHATSAPP_DISPLAY}`;
}

export function getWhatsAppLink(order: OrderData): string {
  const message = generateWhatsAppMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export async function notifyStaffAboutOrder(
  order: OrderData,
): Promise<{ success: boolean; link?: string; message?: string }> {
  try {
    // ✅ Generate the WhatsApp link
    const link = getWhatsAppLink(order);

    // ✅ For now, just log the notification
    console.log("📱 WhatsApp notification generated");
    console.log("📝 Message:", generateWhatsAppMessage(order));

    // ✅ You can also send via API if configured
    // Uncomment this when you have a backend API
    /*
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    */

    return {
      success: true,
      link,
      message: "WhatsApp link generated successfully",
    };
  } catch (error) {
    console.error("Failed to generate WhatsApp link:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ✅ Direct function to open WhatsApp
export function openWhatsApp(order: OrderData): void {
  const link = getWhatsAppLink(order);
  window.open(link, "_blank");
}
