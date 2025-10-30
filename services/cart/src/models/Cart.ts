import { Schema, model } from "mongoose";

const itemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: String,
    price: Number,
    qty: Number
  },
  { _id: true }
);

const cartSchema = new Schema(
  {
    userId: { type: String, index: true, unique: true },
    items: [itemSchema]
  },
  { timestamps: true }
);

export default model("Cart", cartSchema);
