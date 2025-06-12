/**
 * A list of allowed host URLs for image sources.
 * 
 * This array contains URL patterns that are permitted for use in the application.
 * Each entry is a `URL` object representing a specific host or pattern.
 * 
 * Example:
 * - `https://lh3.googleusercontent.com/**` allows images from Googleusercontent.
 * - `https://ichef.bbci.co.uk/**` allows images from BBC iChef.
 */
export const allowedHosts = [
  new URL('https://0.gravatar.com/**'),
  new URL('https://gravatar.com/avatar/**'),
]