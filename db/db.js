import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connection successful: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
