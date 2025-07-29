import mongoose, { Schema, Document, model } from "mongoose";
import { url } from "zod";

const LinkSchema = new Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      default: null
    }
  },
  { timestamps: true }
);

const LinkModel = model("Link", LinkSchema);

export default LinkModel;
