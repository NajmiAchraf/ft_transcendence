import { Global, Module } from '@nestjs/common';
import PingPongGateway from './ping-pong.gateway';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Module({
	providers: [PingPongGateway, GlobalHelperService],
})
export class PingPongModule { }
