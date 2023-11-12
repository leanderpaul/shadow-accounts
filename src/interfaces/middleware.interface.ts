/**
 * Importing npm packages
 */
import { type FastifyReply, type FastifyRequest } from 'fastify';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export type MiddlewareCallback = (req: FastifyRequest, res: FastifyReply, done: () => void) => void;

export type MiddlewarePromise = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export type Middleware = MiddlewareCallback | MiddlewarePromise;
