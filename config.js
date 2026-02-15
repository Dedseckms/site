module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'luxestate-secret-key-change-in-production',
  JWT_EXPIRES: '7d',
  DB_PATH: './data'
};
