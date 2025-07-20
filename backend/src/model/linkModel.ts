import mongoose, { Schema, Document, model } from "mongoose";
import { url } from "zod";

const LinkSchema = new Schema(
  {
    hash: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const LinkModel = model("Link", LinkSchema);

export default LinkModel;
