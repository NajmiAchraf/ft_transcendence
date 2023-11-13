import { Module } from '@nestjs/common';
import PingPongGateway from './ping-pong/ping-pong.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [PingPongGateway],
})
export class AppModule { }
