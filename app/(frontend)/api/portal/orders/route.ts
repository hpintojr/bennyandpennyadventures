import { NextResponse } from "next/server";
import {
  getPortalAuth,
  customerOrderWhere,
  shipmentsByOrder,
  fulfillmentSummary,
  relId,
  type PayloadDoc,
  type PayloadFindResult
} from "@/lib/portalData";

export const runtime = "nodejs";

export async function GET() {
  const { payload, user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = (await payload.find({
    collection: "orders",
    depth: 1,
    limit: 100,
    sort: "-createdAt",
    where: customerOrderWhere(user)
  })) as PayloadFindResult;

  const orderDocs = orders.docs || [];
  const orderIds = orderDocs.map((order) => order.id);

  // Order items grouped per order.
  const itemsByOrder = new Map<string, PayloadDoc[]>();
  for (const orderId of orderIds) {
    const items = (await payload.find({
      collection: "order-items",
      depth: 1,
      limit: 100,
      where: { order: { equals: orderId } }
    })) as PayloadFindResult;
    itemsByOrder.set(String(orderId), items.docs || []);
  }

  // Print-job shipments for all orders (single query).
  const shipMap = await shipmentsByOrder(payload, orderIds);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    orders: orderDocs.map((order) => {
      const shipments = shipMap.get(String(order.id)) || [];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        taxTotal: order.taxTotal,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        total: order.total,
        currency: order.currency,
        itemCount: order.itemCount,
        itemsSummary: order.itemsSummary,
        createdAt: order.createdAt,
        shippingAddressName: order.shippingAddressName,
        shippingAddressLine1: order.shippingAddressLine1,
        shippingAddressLine2: order.shippingAddressLine2,
        shippingAddressCity: order.shippingAddressCity,
        shippingAddressState: order.shippingAddressState,
        shippingAddressPostalCode: order.shippingAddressPostalCode,
        shippingAddressCountry: order.shippingAddressCountry,
        customerId: relId(order.customer),
        customerEmail: order.customerEmail,
        fulfillment: fulfillmentSummary(order, shipments),
        shipments,
        items: (itemsByOrder.get(String(order.id)) || []).map((item) => ({
          id: item.id,
          title: item.title,
          format: item.format,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };
    })
  });
}
