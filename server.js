import { app } from './app.js';
import { connectDB } from './db/db.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;
const server = 'http://localhost';

export const serverAddress = `${server}:${port}`;

const startAnimation = () => {
  const animation = ['| ', '/ ', '- ', '\\ '];
  let index = 0;

  setInterval(() => {
    process.stdout.write('\r' + animation[index]);
    index = (index + 1) % animation.length;
  }, 80);
};

export const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running. API on server: ${serverAddress}`);
    });
  } catch (error) {
    console.error('Cannot connect to MongoDB');
    console.error(error);
    process.exit(1);
  }
};

startServer();
startAnimation();
