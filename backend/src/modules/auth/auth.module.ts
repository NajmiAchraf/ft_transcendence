import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TokenService } from './token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthenticationService } from './authentication/authentication.service';
import { AtStrategy, RtStrategy, GithubStrategy, IntraStrategy } from './strategies';
import { AuthorizationService } from './authorization/authorization.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Module({
  imports: [JwtModule.register({}),
    PrismaModule],
  controllers: [AuthController],
  providers: [TokenService, AuthenticationService, AtStrategy, RtStrategy, GithubStrategy, AuthorizationService, IntraStrategy
    , GlobalHelperService],
})
export class AuthModule { }
