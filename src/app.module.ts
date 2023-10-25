import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { database } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: database().host,
  port: Number(database().port),
  username: database().username,
  password: database().password,
  database: database().database,
  synchronize: Boolean(database().synchronize),
  logging: Boolean(database().logging),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [database],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
