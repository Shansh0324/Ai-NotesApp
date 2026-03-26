/**
 * Generates a 6-digit numeric OTP string.
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
