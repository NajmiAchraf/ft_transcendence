import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService, GlobalHelperService]
})
export class HomeModule { }
