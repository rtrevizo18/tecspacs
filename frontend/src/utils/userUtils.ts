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
    // Check for Auth0 IDs
    if (str.startsWith('auth0|')) return true;
    
    // Check for UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true;
    
    // Check for MongoDB ObjectId format (24 hex characters)
    if (/^[0-9a-f]{24}$/i.test(str)) return true;
    
    // Check for very long strings (likely IDs) - but be more conservative
    if (str.length > 30) return true;
    
    // Only treat as ID if it's very long AND has no spaces AND looks like hex/base64
    if (str.length > 20 && !/\s/.test(str) && (/^[a-f0-9]+$/i.test(str) || /^[A-Za-z0-9+/=]+$/.test(str))) return true;
    
    return false;
  };
  
  console.log('--- getDisplayName DEBUG ---');
  console.log('Input user object:', user);
  
  // Try username first, but skip if it looks like a user ID
  if (user.username && user.username.trim()) {
    const trimmedUsername = user.username.trim();
    const isUserId = isLikelyUserId(trimmedUsername);
    console.log(`Username "${trimmedUsername}" is likely user ID: ${isUserId}`);
    
    if (!isUserId) {
      console.log('USING USERNAME:', trimmedUsername);
      return trimmedUsername;
    }
  }
  
  // Try name, but skip if it looks like a user ID
  if (user.name && user.name.trim()) {
    const trimmedName = user.name.trim();
    const isUserId = isLikelyUserId(trimmedName);
    console.log(`Name "${trimmedName}" is likely user ID: ${isUserId}`);
    
    if (!isUserId) {
      console.log('USING NAME:', trimmedName);
      return trimmedName;
    }
  }
  
  // Try email (part before @)
  if (user.email && user.email.trim()) {
    const emailName = user.email.split('@')[0];
    if (emailName && emailName.trim()) {
      const trimmedEmail = emailName.trim();
      const isUserId = isLikelyUserId(trimmedEmail);
      console.log(`Email part "${trimmedEmail}" is likely user ID: ${isUserId}`);
      
      if (!isUserId) {
        console.log('USING EMAIL PART:', trimmedEmail);
        return trimmedEmail;
      }
    }
  }
  
  // Fall back to fun name based on user ID
  const userId = user._id || user.id || user.auth0Id || 'unknown';
  const fallbackName = getFallbackName(userId);
  console.log('USING FALLBACK NAME:', fallbackName);
  return fallbackName;
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
  console.log('=== DEBUG: getCreatedByDisplayName called with ===');
  console.log('createdBy object:', createdBy);
  console.log('createdBy.username:', createdBy.username);
  console.log('createdBy.name:', createdBy.name);
  console.log('createdBy.email:', createdBy.email);
  console.log('createdBy._id:', createdBy._id);
  
  const result = getDisplayName({
    username: createdBy.username,
    name: createdBy.name,
    email: createdBy.email,
    _id: createdBy._id
  });
  
  console.log('Final result:', result);
  console.log('=== END DEBUG ===');
  return result;
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