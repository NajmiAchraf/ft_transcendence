'use client';

import { useRef, useEffect, useState } from 'react'
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import SocketService from './SocketService';

import { usePropsContext } from '../context/PropsContext';
import { useWebSocketContext } from '../../../context/WebSocketContext';
import { Props } from '../common/Common';

function PlayPingPong() {
	const webContext = useWebSocketContext();
	const propsContext = usePropsContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const socSrv = useRef<SocketService>();

	const [createGame, setCreateGame] = useState<boolean>(false);

	useEffect(() => {
		propsContext.props.canvas = canvasRef.current;
		// console.log('webContext.webSocket.id: ', webContext.webSocket.id);
		function CreateGame() {
			try {
				if (propsContext.props.canvas) {
					socSrv.current = new SocketService(webContext.webSocket, propsContext.props);
				}
			} catch (error) {
				console.error(error);
			}
		}
		if (!createGame) {
			setCreateGame(true);
			CreateGame();
		}
	}, []);

	const leaveGame = () => {
		console.log('leaveGame0');

		socSrv.current?.leaveGame();

		propsContext.setProps({
			...propsContext.props,
			inGame: false
		} as Props);
	};

	return (
		<div className="Parent" id="Parent">
			<div className="section1">
				<div className="player p-left">
					<img src="./img3.png" />
					<h4>Smyto</h4>
				</div>
				<div className="mid-sec">
					<div className="game-timer">
						<h3>10:05</h3>
					</div>
					<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
				</div>
				<div className="player p-right">
					<img src="./img3.png" />
					<h4>Smyto</h4>
				</div>
			</div>
			<canvas ref={canvasRef} id="PingPong"></canvas>
		</div>
	);
}

export default PlayPingPong;
