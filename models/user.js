import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//szyfrowanie hasła
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
//porównanie hasła szyfrowanego z wproawadzonym
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model('User', userSchema);
