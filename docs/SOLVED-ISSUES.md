# Solved Issues & Debugging Notes

## Issue #1: "User is not a constructor"
**Date:** 2026-03-31
**Error:** `TypeError: User is not a constructor`
**Cause:** Exporting schema instead of model
**Solution:**
```javascript
// ❌ Wrong
module.exports = userSchema;

// ✅ Correct
const User = mongoose.model("User", userSchema);
module.exports = User;

