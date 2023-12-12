/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { type JSONData } from '@leanderpaul/shadow-service';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Model } from 'mongoose';

/**
 * Importing user defined packages
 */
import { defaultOptionsPlugin } from '../schema.utils';

/**
 * Defining types
 */

export enum DigestType {
  VERIFY_EMAIL = 0,
  RESET_PASSWORD = 1,
}

export interface DigestModel extends Model<Digest> {}

/**
 * Declaring the constants
 */
const digestRegex = /^[a-zA-Z0-9_-]{22}$/;

@Schema({
  timestamps: { updatedAt: false },
  versionKey: false,
})
export class Digest {
  static readonly Type = DigestType;

  /** Generates a new digest */
  static generateDigest(): string {
    const hasher = new Bun.CryptoHasher('md5');
    hasher.update(`${Date.now()}-${crypto.randomBytes(32)}`);
    return (hasher.digest() as Buffer).toString('base64url');
  }

  static isDigest(digest?: string): boolean {
    if (!digest) return false;
    return digestRegex.test(digest);
  }

  /** The digest value stored as base64url */
  @Prop({
    type: 'string',
    required: true,
    default: () => Digest.generateDigest(),
  })
  _id: string;

  /** The digest value stored as base64url */
  id: string;

  /** The type of digest */
  @Prop({
    type: 'number',
    required: true,
    enum: Object.values(DigestType).filter(v => typeof v === 'number'),
  })
  type: DigestType;

  /** The identifier of the digest */
  @Prop({
    type: 'string',
    required: true,
  })
  identifier: string;

  /** The data associated with the digest */
  @Prop({
    type: 'mixed',
  })
  data?: Record<string, JSONData>;

  /** The date-time when the digest expires */
  @Prop({
    type: 'date',
    required: true,
  })
  expiresAt: Date;

  /** The date-time when the digest was created */
  createdAt: Date;
}

/**
 * Creating the mongoose Schema
 */
const DigestSchema = SchemaFactory.createForClass(Digest);

/**
 * Setting up middlewares
 */
DigestSchema.plugin(defaultOptionsPlugin);
DigestSchema.alias('_id', 'id');

/**
 * Setting up the indexes
 */
DigestSchema.index({ type: 1, identifier: 1 }, { unique: true });

/**
 * Creating the mongoose module
 */
export const DigestMongooseModule = MongooseModule.forFeature([{ name: Digest.name, schema: DigestSchema }]);
