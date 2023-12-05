import { Module } from '@nestjs/common';

import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';

import { AchievementService } from 'src/modules/ping-pong/achievement.service';
import PingPongGateway from 'src/modules/ping-pong/ping-pong.gateway';
import { PingPongService } from 'src/modules/ping-pong/ping-pong.service';

@Module({
	providers: [PingPongGateway, GlobalHelperService, SocketService, PingPongService, AchievementService],
})
export class PingPongModule { }
