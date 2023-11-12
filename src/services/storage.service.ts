/**
 * Importing npm packages
 */
import { StorageService } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const globalRef = global as any;
export const Storage: StorageService = globalRef.storageService || (globalRef.storageService = new StorageService());
