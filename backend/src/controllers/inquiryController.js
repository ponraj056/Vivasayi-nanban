const prisma = require("../config/prisma");

// Get orders (Agri Agency gets items ordered from them, Farmer gets their orders)
exports.getInquiries = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === "farmer") {
      const orders = await prisma.product_orders.findMany({
        where: { farmer_id: req.user.id },
        include: {
          order_items: {
            include: {
              product: true,
              agency: { select: { name: true, phone: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ success: true, inquiries: orders, type: 'farmer_orders' });
    } else if (userRole === "dealer" || userRole === "agri_agency") {
      // For agencies, they only see the order items that belong to them
      const items = await prisma.product_order_items.findMany({
        where: { agency_id: req.user.id },
        include: {
          product: { select: { name: true, price: true, category: true } },
          order: {
            include: {
              farmer: { select: { name: true, phone: true } }
            }
          }
        },
        orderBy: { order: { created_at: 'desc' } }
      });
      return res.json({ success: true, inquiries: items, type: 'agency_order_items' });
    }

    res.json({ success: true, inquiries: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new order (Farmer placing an order)
exports.createInquiry = async (req, res) => {
  try {
    // simplified: Farmer orders one product at a time from Marketplace for now
    const { agencyId, productId, quantity, deliveryAddress, phone, unitPrice } = req.body;
    
    const qty = parseInt(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    const subtotal = qty * price;

    const order = await prisma.product_orders.create({
      data: {
        farmer_id: req.user.id,
        total_amount: subtotal,
        status: "pending",
        delivery_address: deliveryAddress || "",
        phone: phone || req.user.phone || "",
        source: "web",
        order_items: {
          create: [
            {
              product_id: productId,
              agency_id: agencyId,
              quantity: qty,
              unit_price: price,
              subtotal: subtotal
            }
          ]
        }
      }
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (Agency approving an order item, or just updating the main order for simplicity)
exports.respondInquiry = async (req, res) => {
  try {
    const { status } = req.body; // e.g. "approved", "completed", "cancelled"
    
    // As an agency, they update the main order status (assuming 1 item = 1 order for now)
    const itemId = req.params.id; // actually we pass the order item ID or order ID. Let's assume order_id.

    const order = await prisma.product_orders.update({
      where: { id: itemId },
      data: { status }
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
