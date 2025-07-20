import mongoose from 'mongoose';

const connectDb = async()=>{
    try{
        if(!process.env.MONGO_URI){
            throw new Error("MONGO_URI is not defined in the environment variable");
        }
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb connected successfully");
    }
    catch(error){
       
        console.log(error);
    }
}

export default connectDb;