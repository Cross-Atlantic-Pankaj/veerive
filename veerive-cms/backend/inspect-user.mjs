import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const uri = process.env.DB_URL_LOCAL || process.env.DB_URL || process.env.DB_URL_PRODUCTION || process.env.MONGODB_URI;
await mongoose.connect(uri);
const db = mongoose.connection.db;

const doc = await db.collection('users').findOne({ email: 'info@veerive.com' });
if (!doc) {
  console.log('No info@veerive.com in "users" collection');
} else {
  console.log('collection : users');
  console.log('email      :', doc.email);
  console.log('role       :', doc.role);
  console.log('password   :', JSON.stringify(doc.password));
}
await mongoose.disconnect();
