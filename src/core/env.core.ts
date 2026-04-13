export const env = {
  DB_URI: process.env.MONGO_URI || '',
  DB_NAME: process.env.DB_NAME || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
}
