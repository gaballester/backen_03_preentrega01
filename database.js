import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    mongoose.set('strictQuery', false);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 50000,
            connectTimeoutMS: 30000, 
            socketTimeoutMS: 40000,  
          })
        console.log('🍃 Connected to ecommerce database')
    } catch (error) {
        console.log('Connect error ', error)
    }
};

export default connectDB;