import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { CollectionShare } from './collection-share.entity';
import { Collection } from '../collections/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionShare, Collection])],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
