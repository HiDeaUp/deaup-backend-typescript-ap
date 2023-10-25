export const base = () => ({
  jwtTokenSecret: process.env.JWT_TOKEN_SECRET,
  jwtTokenExpirationTime: process.env.JWT_TOKEN_EXPIRATION_TIME,
});
