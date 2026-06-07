import dotenv from 'dotenv';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();

const EMAIL = 'communications@crossatlanticsoftware.com';
const NAME = 'Super Admin';

// Generate a strong random password: 20 chars, mixed classes, URL-safe.
function generatePassword() {
  const sets = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '23456789',
    '!@#$%^&*-_=+',
  ];
  const all = sets.join('');
  const bytes = crypto.randomBytes(64);
  let out = [];
  // guarantee at least one from each class
  sets.forEach((s, i) => { out.push(s[bytes[i] % s.length]); });
  for (let i = out.length; i < 20; i++) out.push(all[bytes[i] % all.length]);
  // shuffle deterministically with more random bytes
  const sh = crypto.randomBytes(out.length);
  for (let i = out.length - 1; i > 0; i--) {
    const j = sh[i] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['SuperAdmin', 'Admin', 'Moderator', 'User'], default: 'User' },
    name: { type: String },
    provider: { type: String, default: 'local' },
    resetToken: { type: String, default: null },
    resetTokenExpiration: { type: Date, default: null },
    lastPasswordUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const User = mongoose.model('User', userSchema, 'users_cms');

async function main() {
  // Prefer the same vars the app uses (mongoConnection.js), fall back to MONGODB_URI.
  let uri = process.env.DB_URL_PRODUCTION
    || process.env.DB_URL
    || process.env.DB_URL_LOCAL
    || process.env.MONGODB_URI;
  if (!uri) throw new Error('No DB connection string found (set DB_URL / DB_URL_PRODUCTION / DB_URL_LOCAL or MONGODB_URI)');

  // The .env password contains an unencoded '@'. Percent-encode the userinfo
  // (between '://' and the LAST '@' before the host) so the driver parses it.
  const schemeIdx = uri.indexOf('://');
  if (schemeIdx !== -1) {
    const scheme = uri.slice(0, schemeIdx + 3);
    const rest = uri.slice(schemeIdx + 3);
    const lastAt = rest.lastIndexOf('@');
    if (lastAt !== -1) {
      const userinfo = rest.slice(0, lastAt);
      const hostPart = rest.slice(lastAt + 1);
      const firstColon = userinfo.indexOf(':');
      const user = userinfo.slice(0, firstColon);
      const pass = userinfo.slice(firstColon + 1);
      uri = `${scheme}${user}:${encodeURIComponent(pass)}@${hostPart}`;
    }
  }

  await mongoose.connect(uri);
  const dbName = mongoose.connection.name;

  const password = generatePassword();
  const hash = await bcryptjs.hash(password, await bcryptjs.genSalt());

  const existing = await User.findOne({ email: EMAIL });
  let action;
  if (existing) {
    existing.role = 'SuperAdmin';
    existing.password = hash;
    existing.provider = 'local';
    existing.lastPasswordUpdate = new Date();
    if (!existing.name) existing.name = NAME;
    await existing.save();
    action = 'UPDATED existing user → SuperAdmin (password reset)';
  } else {
    await new User({
      email: EMAIL,
      password: hash,
      role: 'SuperAdmin',
      name: NAME,
      provider: 'local',
      lastPasswordUpdate: new Date(),
    }).save();
    action = 'CREATED new SuperAdmin user';
  }

  console.log('=== SUPERADMIN RESULT ===');
  console.log('database  :', dbName);
  console.log('collection: users_cms');
  console.log('action    :', action);
  console.log('email     :', EMAIL);
  console.log('password  :', password);
  console.log('role      : SuperAdmin');
  console.log('=========================');

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('ERROR:', e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
