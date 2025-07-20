import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from 'bcryptjs';
import { url } from "zod";

const ContentSchema = new Schema({
  type:String,
  link:String,
  title:String,
  tags:[String],
  user:{
    type: Schema.Types.ObjectId,
    ref: 'User',                 
    required: true   
    
  }
}, { timestamps: true });


const ContentModel = model('Content', ContentSchema);

export default ContentModel;