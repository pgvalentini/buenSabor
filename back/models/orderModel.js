import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        nombreProducto: { type: String, required: true },
        cantidad: { type: Number, required: true },
        imagenProducto: { type: String },
        precioVentaProducto: { type: Number, required: true },
        descripcionProducto: { type: String },
        recetaProducto: { type: String },
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Producto',
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String },
      address: { type: String },
      location: { type: String },
      phone: { type: String },
    },

    paymentMethod: { type: String, required: true },
    shippingOption: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    discount: { type: Number, required: true },
    //taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    totalCost: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    payment_id: { type: String },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    estadoPedido: { type: String, required: true, default: 'A confirmar' },
    numeroFactura: {
      type: Number,
      required: true,
      default: Math.floor(Math.random() * 99999999 + 1),
    },
    horaEstimada: { type: Date },
    tiempoPreparacion: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
