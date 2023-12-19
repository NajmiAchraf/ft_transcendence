'use client';

import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

function WaitPingPong() {
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const leavePair = () => {
		if (propsContext.props.playerType === "player") {
			console.log('leavePair');
			webContext.socketGame.emit("leavePair");
		}
	};

	return (
		<div className="Parent" id="Parent">
			<div className="section1">
				<div className="player p-right">
					<img src="/img3.png" alt="player-right" />
				</div>
				<div className="player p-left game-font">
					<h3>name</h3>
				</div>
				<div className="mid-sec game-font">
					<h3>--:--</h3>
				</div>
				<div className="player p-right game-font">
					<h3>name</h3>
				</div>
				<div className="player p-left">
					<img src="/img3.png" alt="player-left" />
				</div>
			</div>
			<div className='section2'>
				<div className='center-sec'>
					<div className="waiting">
						<h3>wait</h3>
					</div>
				</div>
			</div>

			<div className="section3">
				<IonIcon icon={IonIcons.logOutOutline} onClick={leavePair} />
			</div>
		</div >
	);
}

export default WaitPingPong;
