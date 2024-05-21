/**
 * Importing npm packages
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose, { type Collection, type Connection, type Types } from 'mongoose';

/**
 * Importing user defined packages
 */
import { Config, Logger } from '@app/services';

import { AccountMongooseModule } from './accounts/account.model';
import { ServiceAccountMongooseModule } from './accounts/service-account.model';
import { UserMongooseModule } from './accounts/user.model';
import { DatabaseService } from './database.service';
import { AppServiceMongooseModule } from './system/app-service.model';
import { DigestMongooseModule } from './system/digest.model';

/**
 * Defining types
 */

export type ID = Types.ObjectId;

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('MongoDBModule');

function mongooseDebugLogger(this: Collection, collectionName: string, methodName: string, ...methodArgs: any[]) {
  const args: string[] = [];
  for (const value of methodArgs) args.push(this.$format(value));
  logger.debug(`db.${collectionName}.${methodName}(${args.join(', ')})`);
}

const MongoDBModule = MongooseModule.forRoot(Config.get('db.uri'), {
  appName: Config.get('app.name'),
  connectionFactory(connection: Connection) {
    logger.debug(`mongodb connection opened to '${Config.get('db.uri')}', readyState: ${connection.readyState}`);

    /** Setting mongoose options */
    mongoose.set('id', false);
    mongoose.set('runValidators', true);
    mongoose.set('returnOriginal', false);
    mongoose.set('translateAliases', true);
    mongoose.set('toObject', { virtuals: true });
    if (Config.get('log.level') === 'debug') mongoose.set('debug', mongooseDebugLogger);

    /** Handling mongoose connection errors */
    connection.on('error', (err: Error) => logger.error(err));
    connection.on('close', () => logger.debug(`mongodb connection closed`));

    return connection;
  },
});

@Module({
  imports: [MongoDBModule, AccountMongooseModule, UserMongooseModule, ServiceAccountMongooseModule, DigestMongooseModule, AppServiceMongooseModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
