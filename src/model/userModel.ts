import {Model, Schema} from "mongoose";

const UserSchema = new Schema({
    username:{type:String, unique:true},
    password:{type:String, required:true}
})

const UserModel = new Model(UserSchema, "User");

export UserModel