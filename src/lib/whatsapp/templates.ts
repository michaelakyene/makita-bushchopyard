// src/lib/whatsapp/templates.ts
import { RESTAURANT_CONFIG } from "@/lib/constants";

export const whatsappTemplates = {
  // ✅ Order confirmation template
  orderConfirmation: (order: any) => {
    const items = order.items
      .map(
        (item: any) =>
          `  • ${item.quantity}x ${item.name} - ${RESTAURANT_CONFIG.CURRENCY}${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n");

    return `🆕 *NEW ORDER!* 🍽️

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

--- 
📱 *Restaurant:* ${RESTAURANT_CONFIG.BUSINESS_NAME}
📍 *WhatsApp:* ${RESTAURANT_CONFIG.WHATSAPP_DISPLAY}`;
  },

  // ✅ Order status update template
  orderStatusUpdate: (orderId: string, status: string) => {
    const statusEmojis: Record<string, string> = {
      confirmed: "✅",
      preparing: "👨‍🍳",
      ready: "🍽️",
      "out-for-delivery": "🚚",
      delivered: "🎉",
    };

    return `${statusEmojis[status] || "📋"} *Order #${orderId.slice(0, 8).toUpperCase()}* is now *${status.toUpperCase()}*!

${RESTAURANT_CONFIG.BUSINESS_NAME}
📱 ${RESTAURANT_CONFIG.WHATSAPP_DISPLAY}`;
  },

  // ✅ Customer info template
  customerInfo: (name: string, phone: string) => {
    return `👤 *Customer Info*
📧 Name: ${name}
📞 Phone: ${phone}

${RESTAURANT_CONFIG.BUSINESS_NAME}
📱 ${RESTAURANT_CONFIG.WHATSAPP_DISPLAY}`;
  },
};
