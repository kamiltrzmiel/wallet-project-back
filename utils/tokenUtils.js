import jwt from 'jsonwebtoken';

//generowanie tokena dostepu na podstawie id uzytkowanika
const generateAccessToken = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//generowanie refresh tokena na podst id uzytk
const generateRefreshToken = userId => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

//generowanie obiektu z powyzszymi tokenami
const generateAuthTokens = userId => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

export { generateAccessToken, generateRefreshToken, generateAuthTokens };
