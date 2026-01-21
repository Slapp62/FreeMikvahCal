/**
 * Remove sensitive fields from user object
 */
const normalizeUser = (user) => {
  if (!user) return null;

  const normalized = user.toObject ? user.toObject() : { ...user };

  delete normalized.password;
  delete normalized.resetPasswordToken;
  delete normalized.emailVerificationToken;
  delete normalized.loginAttempts;
  delete normalized.lockoutUntil;
  delete normalized.__v;

  return normalized;
};

/**
 * Normalize cycle data
 */
const normalizeCycle = (cycle) => {
  if (!cycle) return null;

  const normalized = cycle.toObject ? cycle.toObject() : { ...cycle };

  delete normalized.__v;
  delete normalized.isDeleted;
  delete normalized.deletedAt;

  return normalized;
};

/**
 * Normalize array of cycles
 */
const normalizeCycles = (cycles) => {
  if (!Array.isArray(cycles)) return [];
  return cycles.map(normalizeCycle);
};

module.exports = {
  normalizeUser,
  normalizeCycle,
  normalizeCycles,
};
