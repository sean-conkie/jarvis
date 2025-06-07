/**
 * The base URL for the application, determined by the `NEXT_PUBLIC_BASE_URL` environment variable.
 * If the environment variable is not set, defaults to "http://localhost:3000".
 *
 * @remarks
 * This constant is typically used for constructing API endpoints or for client-server communication.
 *
 * @example
 * fetch(`${baseUrl}/api/data`)
 */
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";


/**
 * The base URL for the backend API.
 *
 * This value is determined by the `BACKEND_URL` environment variable if it is set;
 * otherwise, it defaults to "http://localhost:8000".
 *
 * @remarks
 * Use this constant to configure API requests to the backend server.
 */
export const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";