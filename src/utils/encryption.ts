
import CryptoJS from 'crypto-js';

// The secret key should ideally be stored in a secure environment variable
// For this demo, we'll use a fixed key
const SECRET_KEY = "trading-platform-secure-key-2025";

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Function to compare password with stored hash
export const comparePassword = (password: string, hashedPassword: string): boolean => {
  const hashedInput = CryptoJS.SHA256(password).toString();
  return hashedInput === hashedPassword;
};
