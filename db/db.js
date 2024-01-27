// import mongoose from 'mongoose';
// import { config } from 'dotenv';

// config();

// export const connectDB = async () => {
//   try {
//     const connect = await mongoose.connect(process.env.DB_HOST, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`Database connection successful: ${connect.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

import { Database } from 'arangojs';
import { config } from 'dotenv';

config();

const db = new Database({
  url: process.env.DB_HOST, // replace
  databaseName: process.env.DB_NAME,
});

db.useBasicAuth(process.env.DB_USERNAME, process.env.DB_PASSWORD);

export default db;
