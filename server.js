import { app } from './app.js';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import https from 'https';

config();

const uriDb = process.env.DB_HOST;

const startAnimation = () => {
  const animation = ['| ', '/ ', '- ', '\\ '];
  let index = 0;

  setInterval(() => {
    process.stdout.write('\r' + animation[index]);
    index = (index + 1) % animation.length;
  }, 80);
};

const runServer = async () => {
  try {
    const connection = await mongoose.connect(uriDb);
    console.log('Database connection successful');

    const options = {
      key: process.env.KEY,
      cert: process.env.CERT,
    };

    https.createServer(options, app).listen(3000, () => {
      console.log('Server running. Use our API on port: 3000');
      console.log('>>> Press Ctrl+C to stop <<<');
    });
  } catch (error) {
    console.log('Cannot connect to MongoDB');
    console.error(error);
    process.exit(1);
  }
};

runServer();
startAnimation();
