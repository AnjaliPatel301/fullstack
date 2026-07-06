const TrackingUpdate = require('../models/TrackingUpdate');
const Notification = require('../models/Notification');

const STATUS_MESSAGES = {
  order_placed: 'Your order has been placed successfully.',
  seller_accepted: 'Your order has been accepted by the seller.',
  packed: 'Your order has been packed and is ready for pickup soon.',
  ready_for_pickup: 'Your order is ready for courier pickup.',
  picked_up: 'Your order has been picked up by the courier.',
  shipped: 'Your order has been shipped.',
  reached_sorting_center: 'Your order reached the sorting center.',
  in_transit: 'Your order is in transit.',
  reached_destination_city: 'Your order reached your city.',
  out_for_delivery: 'Your order is out for delivery.',
  delivered: 'Your order has been delivered. Thank you for shopping with us!',
  failed_delivery: 'Delivery attempt failed for your order.',
  returned: 'Your order has been marked as returned.',
  cancelled: 'Your order has been cancelled.',
};

// Creates a TrackingUpdate entry (the single source of truth for the customer
// tracking timeline) and a customer-facing Notification in one call.
async function logTracking(orderId, { status, location, note, courier, deliveryPhoto, failureReason, customerSignature }, targetUserId) {
  const tracking = await TrackingUpdate.create({
    order: orderId,
    courier,
    status,
    location,
    note,
    deliveryPhoto,
    customerSignature,
    failureReason,
  });

  if (targetUserId) {
    await Notification.create({
      title: 'Order Update',
      message: note || STATUS_MESSAGES[status] || `Order status: ${status.replace(/_/g, ' ')}`,
      type: 'push',
      targetRole: 'user',
      targetUser: targetUserId,
      relatedOrder: orderId,
    });
  }

  return tracking;
}

module.exports = { logTracking, STATUS_MESSAGES };
