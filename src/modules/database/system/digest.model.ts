/**
 * Importing npm packages
 */
import crypto from 'crypto';

import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Model, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { defaultOptionsPlugin } from '../schema.utils';

/**
 * Defining types
 */

export interface DigestModel extends Omit<Model<Digest>, 'create' | 'insert' | 'insertMany'> {}

export interface VerifyEmailDigestModel extends Model<VerifyEmailDigest> {}

export interface ResetPasswordDigestModel extends Model<ResetPasswordDigest> {}

/**
 * Declaring the constants
 */
const generateDigest = (): Buffer => new Bun.CryptoHasher('md5').update(`${Date.now()}-${crypto.randomBytes(32)}`).digest() as Buffer;

@Schema({
  timestamps: { updatedAt: false },
  versionKey: false,
})
export class Digest {
  @Prop({
    type: 'string',
    required: true,
    default: () => generateDigest().toString('base64url'),
  })
  digest: string;

  @Prop({
    type: 'ObjectId',
    required: true,
  })
  uid: Types.ObjectId;

  @Prop({
    type: 'date',
    required: true,
  })
  expiresAt: Date;

  createdAt: Date;
}

@Schema()
export class VerifyEmailDigest extends Digest {
  type: 'VerifyEmailDigest';

  @Prop({
    type: 'string',
    required: true,
  })
  email: string;
}

@Schema()
export class ResetPasswordDigest extends Digest {
  type: 'ResetPasswordDigest';
}

/**
 * Creating the mongoose Schema
 */
const DigestSchema = SchemaFactory.createForClass(Digest);
const VerifyEmailDigestSchema = SchemaFactory.createForClass(VerifyEmailDigest);
const ResetPasswordDigestSchema = SchemaFactory.createForClass(ResetPasswordDigest);

/**
 * Setting up middlewares
 */
DigestSchema.plugin(defaultOptionsPlugin);

/**
 * Setting up the indexes
 */
DigestSchema.index({ digest: 1 }, { name: 'UNIQUE_DIGEST', unique: true, background: true });

/**
 * Creating the mongoose module
 */
export const DigestMongooseModule = MongooseModule.forFeature([
  {
    name: Digest.name,
    schema: DigestSchema,
    discriminators: [
      { name: VerifyEmailDigest.name, schema: VerifyEmailDigestSchema },
      { name: ResetPasswordDigest.name, schema: ResetPasswordDigestSchema },
    ],
  },
]);
