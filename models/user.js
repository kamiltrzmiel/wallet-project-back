// import { Schema, model } from 'mongoose';

// const userSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       unique: true,
//       required: [true, 'Email is required'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//     },
//     token: {
//       type: String,
//       default: null,
//     },
//   },
//   { versionKey: false, timestamps: true }
// );

// userSchema.post('save', handleDbErrors);

// const registerSchema = Joi.object({
//   name: Joi.string().required(),
//   email: Joi.string().required(),
//   password: Joi.string().required(),
// });

// const loginSchema = Joi.object({
//   email: Joi.string().required(),
//   password: Joi.string().required(),
// });

// export const User = model('user', userSchema);

// export const schemas = {
//   registerSchema,
//   loginSchema,
// };
import Joi from 'joi';
import { handleDbErrors } from '../assets/handleDbErrors.js';

const userSchema = {
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  token: Joi.string().default(null),
};
const handleSave = user => {
  handleDbErrors(user);
};

export const arangoUserSchema = {
  schema: userSchema,
  postSave: handleSave,
};

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
