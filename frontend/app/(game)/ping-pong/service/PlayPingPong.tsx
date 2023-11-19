'use client';

import { useRef, useEffect, useState } from 'react'
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import { usePropsContext } from '@/app/context/PropsContext';
import { useWebSocketContext } from '@/app/context/WebSocketContext';
import { useCanvasContext } from '@/app/context/CanvasContext';

import { Props } from '@/app/(game)/ping-pong/common/Common';

function PlayPingPong() {
	const canvasContext = useCanvasContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const startTime = useRef<number>(Date.now());
	const [currentTime, setCurrentTime] = useState<string>("--:--");

	useEffect(() => {
		canvasContext.canvas = canvasRef.current;
		if (!canvasContext.canvas) {
			throw new Error("Canvas not defined");
		}
	}, []);

	const interval = setInterval(() => {
		if (propsContext.props.startPlay) {
			const time = (Date.now() - startTime.current) / 1000;
			const min = Math.floor(time / 60);
			const sec = Math.floor(time % 60);
			setCurrentTime(`${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`);
		}

		if (propsContext.props.endGame) {
			clearInterval(interval);
		}
	}, 1000 / 60);

	const leaveGame = () => {
		console.log(Date.now() - startTime.current);
		// if (propsContext.props.startPlay) {
		if (Date.now() - startTime.current > 3000) {
			console.log('leaveGame');

			webContext.webSocket.emit("leaveGame");

			propsContext.setProps({
				...propsContext.props,
				inGame: false
			} as Props);

			// route to home
		}
	};

	const leaveQueue = () => {
		if (propsContext.props.playerType === "player") {
			console.log('leaveQueue');
			webContext.webSocket.emit("leaveQueue");

			propsContext.setProps({
				...propsContext.props,
				inGame: false
			} as Props);

			// route to home
		}
	};

	return (
		<div className="Parent" id="Parent">
			<div className="section1">
				<div className="player p-left">
					<img src="/img3.png" alt="player-left" />
					<h4>Smyto</h4>
				</div>
				<div className="mid-sec">
					<div className="game-timer">
						<h3>{currentTime}</h3>
					</div>

					{/* {propsContext.props.startPlay ? (
						<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
					) : (
						<IonIcon icon={IonIcons.logOutOutline} onClick={leaveQueue} />
					)} */}
				</div>
				<div className="player p-right">
					<img src="/img3.png" alt="player-right" />
					<h4>Smyto</h4>
				</div>
			</div>
			<div className='section2'>
				<div className='center-sec'>
					{!propsContext.props.startPlay && (
						<div className="waiting">
							<h3>Wait</h3>
						</div>
					)}
				</div>
			</div>
			<canvas ref={canvasRef} id="PingPong"></canvas>
		</div >
	);
}

export default PlayPingPong;
