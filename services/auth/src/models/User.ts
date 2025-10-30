import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, index: true },
    name: String,
    passwordHash: String,       // null for Google users
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: String,
    tokenVersion: { type: Number, default: 0 } // bumps on password change or logout-all
  },
  { timestamps: true }
);

export default model("User", userSchema);
