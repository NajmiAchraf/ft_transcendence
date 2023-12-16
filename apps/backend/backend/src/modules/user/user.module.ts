import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelperService } from './user_helper.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { TwoFactorService } from './twoFactor/twoFactor.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserHelperService, GlobalHelperService, TwoFactorService],
})
export class UserModule { }
