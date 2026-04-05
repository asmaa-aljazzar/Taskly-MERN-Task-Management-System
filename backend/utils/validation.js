// Sanitize	Clean/modify to make it safe	" JOHN@example.com " → "john@example.com"
// Validate	Check if it's acceptable	"notanemail" → ❌ REJECT

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
    return passwordRegex.test(password);
};

// For names, fullName, text fields
const sanitizeText = (input) => {
    if (typeof input !== 'string') return input;
    // Remove HTML tags and dangerous characters
    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '')     // Remove < and >
        .substring(0, 255);       // Limit length
};

// For email specifically
const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return email;
    return email.trim().toLowerCase().substring(0, 254);
};

// For phone numbers
const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return phone;
    // Keep only +, digits, spaces, hyphens, parentheses
    return phone
        .trim()
        .replace(/[^+\d\s\-\(\)]/g, '')
        .substring(0, 20);
};

// For URLs (profile images)
const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return url;
    const trimmed = url.trim();
    // Block javascript: protocol
    if (trimmed.toLowerCase().startsWith('javascript:')) {
        return '';
    }
    return trimmed.substring(0, 500);
};

// Keep original for backward compatibility
const sanitizeInput = (input) => {
    return sanitizeText(input);
};

module.exports = { 
    validateEmail, 
    validatePassword, 
    sanitizeInput,
    sanitizeText,
    sanitizeEmail,
    sanitizePhone,
    sanitizeUrl
};