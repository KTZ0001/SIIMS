
export const generateResetToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};
