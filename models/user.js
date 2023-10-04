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
userSchema.pre('save', async next => {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});
//porównanie hasła szyfrowanego z wproawadzonym
userSchema.methods.comparePassword = async enteredPassword => {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model('User', userSchema);
