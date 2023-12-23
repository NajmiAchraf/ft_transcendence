'use client';

import { useRouter } from 'next/navigation';

import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

function WaitPingPong() {
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const router = useRouter();

	const leave = async () => {
		// disconnect socket after leave
		webContext.socketGame.disconnect();

		router.push("/home");
	};

	const leavePair = async () => {
		if (propsContext.props.playerType === "player") {
			if (!optionsContext.options.invite) {
				console.log('leavePair');
				webContext.socketGame.emit("leavePair");
			}
			else if (optionsContext.options.invite) {
				await leave();
			}
		}
	};

	return (
		<div className="Parent">
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
