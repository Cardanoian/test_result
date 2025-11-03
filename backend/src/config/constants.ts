export const MODEL = 'gemini-2.5-flash';
export const PORT = process.env.PORT || 3050;
export const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];
export const NODE_ENV = process.env.NODE_ENV || 'development';
