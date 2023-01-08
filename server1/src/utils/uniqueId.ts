import crypto from 'crypto';

export const generateUniqueKey = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};
