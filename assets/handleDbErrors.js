export const handleDbErrors = (error, _, next) => {
  const { name, code } = error;
  //duplicate key error (e11000 duplicate key error)
  error.status = name === 'MongoDBServerError' && code === 11000 ? 409 : 400;
  next();
};
