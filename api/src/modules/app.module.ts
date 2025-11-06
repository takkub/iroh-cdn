import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { PrismaService } from '../shared/prisma.service';

@Module({
  imports: [AssetsModule],
  providers: [PrismaService],
})
export class AppModule {}
