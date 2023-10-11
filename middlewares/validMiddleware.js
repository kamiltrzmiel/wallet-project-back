import Joi from 'joi';

export const registrationSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  password: Joi.string().min(1).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  password: Joi.string().required(),
});

export const validateRegister = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
