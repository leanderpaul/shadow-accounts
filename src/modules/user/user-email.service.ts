/**
 * Importing npm packages
 */
import { Injectable } from '@nestjs/common';
import lodash from 'lodash';
import moment from 'moment';

/**
 * Importing user defined packages
 */
import { RequestCache } from '@app/decorators';
import { IAMError, IAMErrorCode } from '@app/errors';
import { DatabaseService, Digest, type ID, User, UserVariant } from '@app/modules/database';
import { UserEmail } from '@app/modules/database/database.types';
import { Logger, MailService } from '@app/services';
import { CacheKey } from '@app/services/cache';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class UserEmailService {
  private readonly logger = Logger.getLogger(UserEmailService.name);

  private readonly nativeUserModel;
  private readonly userModel;

  private readonly digestModel;

  constructor(
    databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {
    this.userModel = databaseService.getUserModel();
    this.nativeUserModel = databaseService.getUserModel(UserVariant.NATIVE);

    this.digestModel = databaseService.getDigestModel();
  }

  async createVerifyEmailDigest(aid: ID, uid: ID, email: string): Promise<Digest> {
    const type = Digest.Type.VERIFY_EMAIL;
    const expiresAt = moment().add(30, 'day').toDate();
    const data = { aid: aid.toString(), uid: uid.toString() };
    const digest = Digest.generateDigest();
    return await this.digestModel.create({ id: digest, type, identifier: email, data, expiresAt });
  }

  async getVerifyEmailDigest(digestOrEmail: string): Promise<Digest | null> {
    let query: Record<string, string | number>;
    if (User.Email.isEmail(digestOrEmail)) query = { type: Digest.Type.VERIFY_EMAIL, identifier: digestOrEmail };
    else if (Digest.isDigest(digestOrEmail)) query = { id: digestOrEmail };
    else return null;
    const digest = await this.digestModel.findOne(query).lean();
    if (!digest) return null;
    const expired = moment().isAfter(digest.expiresAt);
    if (!expired) return digest as Digest;
    await this.digestModel.deleteOne({ _id: digest._id });
    return null;
  }

  @RequestCache('get', CacheKey.getUserEmailListKey)
  async getUserEmails(uid: ID): Promise<UserEmail[]> {
    const user = await this.userModel.findOne({ uid }, 'emails').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    return user.emails;
  }

  async sendEmailVerificationMail(uid: ID, email: string): Promise<void> {
    const user = await this.userModel.findOne({ uid }, 'aid emails firstName').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const userEmail = user.emails.find(e => e.email === email);
    if (!userEmail) throw new IAMError(IAMErrorCode.U010);
    if (userEmail.verified) throw new IAMError(IAMErrorCode.U004);
    let digest = await this.getVerifyEmailDigest(email);
    if (!digest) digest = await this.createVerifyEmailDigest(user.aid, uid, email);
    this.mailService.sendEmailVerificationMail(email, user.firstName, digest.id);
  }

  @RequestCache('clear')
  async verifyUserEmail(email: string): Promise<boolean> {
    const user = await this.nativeUserModel.findOne({ 'emails.email': email }).lean();
    if (!user) throw new IAMError(IAMErrorCode.U005);
    const userEmail = user.emails.find(e => e.email === email) as UserEmail;
    if (userEmail.verified) throw new IAMError(IAMErrorCode.U004);
    const update: Record<string, boolean | number> = { 'emails.$.verified': true };
    if (user.status === User.Status.UNVERIFIED && userEmail.primary) update.status = User.Status.ACTIVE;
    await this.nativeUserModel.updateOne({ uid: user.uid, 'emails.email': email }, { $set: update });
    return true;
  }

  @RequestCache('del', CacheKey.getUserEmailListKey)
  async addUserEmail(uid: ID, email: string, verified: boolean = false): Promise<UserEmail> {
    const user = await this.userModel.findOne({ uid }, 'aid firstName emails').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const emailExists = await this.userModel.exists({ 'emails.email': email });
    if (emailExists) throw new IAMError(IAMErrorCode.U009);
    const userEmail = { email, verified };
    await this.userModel.updateOne({ uid }, { $push: { emails: userEmail } });
    if (!verified) {
      const digest = await this.createVerifyEmailDigest(user.aid, uid, email);
      this.mailService.sendEmailVerificationMail(email, user.firstName, digest.id);
    }
    return userEmail;
  }

  @RequestCache('del', CacheKey.getUserEmailListKey)
  async deleteUserEmail(uid: ID, email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ uid }, 'emails').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const userEmail = user.emails.find(e => e.email === email);
    if (!userEmail) throw new IAMError(IAMErrorCode.U010);
    if (userEmail.primary) throw new IAMError(IAMErrorCode.U012);
    const result = await this.userModel.updateOne({ uid }, { $pull: { emails: { email } } });
    this.digestModel.deleteOne({ type: Digest.Type.VERIFY_EMAIL, identifier: email }).catch(err => this.logger.error('Error deleting email digest', { email, error: err }));
    return result.modifiedCount === 1;
  }

  @RequestCache('del', CacheKey.getUserEmailListKey)
  async setPrimaryUserEmail(uid: ID, email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ uid }, 'emails').lean();
    if (!user) throw new IAMError(IAMErrorCode.U001);
    const userEmail = user.emails.find(e => e.email === email);
    if (!userEmail) throw new IAMError(IAMErrorCode.U010);
    if (!userEmail.verified) throw new IAMError(IAMErrorCode.U011);
    const userEmails = user.emails.map(e => (e.email === email ? { ...e, primary: true } : lodash.pick(e, ['email', 'verified'])));
    const result = await this.userModel.updateOne({ uid }, { $set: { emails: userEmails } });
    return result.modifiedCount === 1;
  }
}
