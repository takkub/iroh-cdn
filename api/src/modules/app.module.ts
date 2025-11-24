import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { PrismaService } from '../shared/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AssetsModule,
    AuthModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule { }
