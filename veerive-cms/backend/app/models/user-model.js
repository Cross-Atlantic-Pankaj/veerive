// // import {Schema, model} from 'mongoose'

// // const userSchema = new Schema ({
// //     email: { type: String, required: true },
// //     password: { type: String, required: true },
// //     role: { type: String, enum: ['Admin', 'Moderator', 'User'], default: 'User' },    // Role assigned to the user
// // }, {timestamps: true})

// // const User = model('User', userSchema)

// // export default User


// import { Schema, model } from 'mongoose';

// const userSchema = new Schema(
//   {
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['Admin', 'Moderator', 'User'], default: 'User' },
//     name: { type: String }, // Optional name field
//     resetToken: { type: String, default: null }, // Add this field
//     resetTokenExpiration: { type: Date, default: null }, // Add this field
//   },
//   { timestamps: true }
// );

// const User = model('User', userSchema);

// export default User;
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    role: { type: String, enum: ['SuperAdmin', 'Admin', 'Moderator', 'User'], default: 'User' },
    name: { type: String }, // Optional name field
    provider: { type: String, enum: ['local', 'google', 'facebook', 'linkedin', 'twitter'], default: 'local' }, // Track the provider
    resetToken: { type: String, default: null }, // For password reset
    resetTokenExpiration: { type: Date, default: null },
    lastPasswordUpdate: { type: Date, default: Date.now }, // Add this field for password expiry checks
  },
  { timestamps: true }
);


const User = model('User', userSchema, 'users_cms');

export default User;
