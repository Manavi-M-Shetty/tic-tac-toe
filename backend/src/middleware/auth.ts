/**
 * Authentication Middleware
 * -------------------------
 * This middleware is responsible for verifying JWT tokens sent by
 * the frontend. Any protected route in the application uses this 
 * middleware to ensure that only authenticated users can access it.
 *
 * Key Responsibilities:
 *  - Read the Authorization header
 *  - Extract and validate the JWT token
 *  - Decode the user information from the token
 *  - Attach the decoded user object to `req.user`
 *  - Block the request if the token is missing or invalid
 *
 * Usage:
 *   router.get('/profile', requireAuth, (req, res) => { ... })
 *
 * The frontend must send the token in the following format:
 *   Authorization: Bearer <jwt_token>
 *
 * If the token is valid, the middleware allows the request to continue.
 * If not, it returns a 401 Unauthorized response.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Extends the default Express Request object
 * so that we can store the authenticated user's details.
 */
export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

/**
 * requireAuth Middleware
 * ----------------------
 * Checks whether the request contains a valid JWT token.
 * If valid:
 *   - Decodes the token
 *   - Stores `id` and `username` inside req.user
 *   - Allows the request to proceed
 *
 * If invalid:
 *   - Responds with 401 Unauthorized
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;

  // No Authorization header found
  if (!auth) return res.status(401).json({ error: 'No token' });

  // Expected format: "Bearer <token>"
  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Attach user info to the request object
    req.user = { id: decoded.id, username: decoded.username };

    next(); // Continue to the next middleware/route
  } catch (err) {
    // Token is expired, malformed, or invalid
    return res.status(401).json({ error: 'Invalid token' });
  }
};
