/**
 * Utility functions for handling user display names and related functionality
 */

// Fun fallback names for users without usernames
const FALLBACK_NAMES = [
  "Unknown Builder",
  "Mysterious Wanderer", 
  "Code Phantom",
  "Digital Nomad",
  "Anonymous Creator",
  "Secret Coder",
  "Hidden Genius",
  "Unnamed Hero",
  "Stealth Developer",
  "Ghost Writer",
  "Enigmatic Maker",
  "Faceless Architect",
  "Invisible Innovator",
  "Masked Programmer",
  "Quiet Craftsman"
];

/**
 * Gets a deterministic fallback name based on user ID
 * This ensures the same user always gets the same fallback name
 */
function getFallbackName(userId: string): string {
  // Create a simple hash from the userId to pick a consistent fallback name
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % FALLBACK_NAMES.length;
  return FALLBACK_NAMES[index];
}

/**
 * Gets the display name for a user, with intelligent fallbacks
 * Priority: username -> name -> email (before @) -> fun fallback based on ID
 */
export function getDisplayName(user: {
  username?: string;
  name?: string; 
  email?: string;
  _id?: string;
  id?: string;
  auth0Id?: string;
}): string {
  // Helper function to check if a string is likely a user ID
  const isLikelyUserId = (str: string): boolean => {
    // Check for Auth0 IDs (format: auth0|xxxxxxxxxxxxxxxxxxxxxxxx)
    if (str.startsWith('auth0|')) return true;
    
    // Check for Google OAuth IDs (format: google-oauth2|xxxxxxxxxxxxxxxxxx)
    if (str.startsWith('google-oauth2|')) return true;
    
    // Check for auto-generated usernames (format: user_xxxxxxxxxx)
    if (str.startsWith('user_')) return true;
    
    // Check for UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true;
    
    // Check for MongoDB ObjectId format (24 hex characters)
    if (/^[0-9a-f]{24}$/i.test(str)) return true;
    
    // Check for very long alphanumeric strings that look like generated IDs
    if (str.length > 25 && !/[\s\W]/.test(str) && /^[a-zA-Z0-9]+$/.test(str)) return true;
    
    // Check for base64-like patterns (long strings with specific chars)
    if (str.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(str) && !/[aeiou]{2,}/i.test(str)) return true;
    
    return false;
  };
  
  // Try username first, but skip if it looks like a user ID
  if (user.username && user.username.trim()) {
    const trimmedUsername = user.username.trim();
    const isUserId = isLikelyUserId(trimmedUsername);
    
    if (!isUserId) {
      return trimmedUsername;
    }
  }
  
  // Try name, but skip if it looks like a user ID
  if (user.name && user.name.trim()) {
    const trimmedName = user.name.trim();
    const isUserId = isLikelyUserId(trimmedName);
    
    if (!isUserId) {
      return trimmedName;
    }
  }
  
  // Try email (part before @)
  if (user.email && user.email.trim()) {
    const emailName = user.email.split('@')[0];
    if (emailName && emailName.trim()) {
      const trimmedEmail = emailName.trim();
      const isUserId = isLikelyUserId(trimmedEmail);
      
      if (!isUserId) {
        return trimmedEmail;
      }
    }
  }
  
  // Fall back to fun name based on user ID
  const userId = user._id || user.id || user.auth0Id || 'unknown';
  return getFallbackName(userId);
}

/**
 * Gets the initial letter for display (for avatars, etc.)
 */
export function getDisplayInitial(user: {
  username?: string;
  name?: string;
  email?: string;
  _id?: string;
  id?: string;
  auth0Id?: string;
}): string {
  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase();
}

/**
 * Checks if a user has a custom name (not using fallback)
 */
export function hasCustomName(user: {
  username?: string;
  name?: string;
  email?: string;
}): boolean {
  return !!(
    (user.username && user.username.trim()) ||
    (user.name && user.name.trim()) ||
    (user.email && user.email.trim())
  );
}

/**
 * Gets display name from a createdBy object (API format)
 */
export function getCreatedByDisplayName(createdBy: {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
}): string {
  return getDisplayName({
    username: createdBy.username,
    name: createdBy.name,
    email: createdBy.email,
    _id: createdBy._id
  });
}

/**
 * Gets display initial from a createdBy object (API format)
 */
export function getCreatedByDisplayInitial(createdBy: {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
}): string {
  return getDisplayInitial({
    username: createdBy.username,
    name: createdBy.name,
    email: createdBy.email,
    _id: createdBy._id
  });
}