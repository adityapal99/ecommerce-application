import { Schema, model } from "mongoose";
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String, unique: true },
    image: String
  },
  { timestamps: true }
);
export default model("Product", productSchema);
