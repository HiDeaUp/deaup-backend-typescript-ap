import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { database } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

const databaseConfig = database();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: databaseConfig.host,
  port: Number(databaseConfig.port),
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: Boolean(databaseConfig.synchronize),
  logging: Boolean(databaseConfig.logging),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [database],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
