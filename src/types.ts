/**
 * Importing npm packages
 */
import { type JSONData } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

declare module 'fastify' {
  interface FastifyReply {
    view(template: string, data?: Record<string, JSONData>): FastifyReply;
  }
}
