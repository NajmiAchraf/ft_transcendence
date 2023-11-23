import { Module } from '@nestjs/common';
import PingPongGateway from './ping-pong.gateway';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';
import { PingPongService } from './ping-pong.service';
import { AchievementService } from './achievement.service';

@Module({
	providers: [PingPongGateway, GlobalHelperService, SocketService, PingPongService, AchievementService],
})
export class PingPongModule { }
