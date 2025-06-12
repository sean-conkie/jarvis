import * as crypto from 'crypto';

// CRITICAL: Generate the SHA256 hash correctly for all Gravatar operations
export function getGravatarHash(email: string): string {
  // Trim and lowercase the email - BOTH steps are required
  email = email.trim().toLowerCase();

  // Create SHA256 hash (using a crypto library)
  const hash = crypto.createHash('sha256').update(email).digest('hex');

  return hash;
}

// This single hash is used for BOTH avatars AND profile data
export const gravatarHash = getGravatarHash(process.env.NEXT_PUBLIC_GRAVATAR_EMAIL || '');

// The Gravatar URL is constructed using the hash
export const gravatarUrl = `https://gravatar.com/avatar/${gravatarHash}`;