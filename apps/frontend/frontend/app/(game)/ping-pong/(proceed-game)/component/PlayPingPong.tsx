'use client';

import { useRouter } from 'next/navigation';

import { useRef, useEffect, useState } from 'react'
import * as IonIcons from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import { useCanvasContext } from '@/app/(game)/ping-pong/context/CanvasContext';
import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import { CanvasComponent } from '@/app/(game)/ping-pong/game/Game';
import { Text } from '@/app/(game)/ping-pong/game/Board';

import { getCookie } from '@/app/components/errorChecks';

async function getData(userId: string): Promise<any> {
	// convert userId to number
	const userID = parseInt(userId);
	const data = await fetch(`${process.env.API_URL}/user/personal_infos`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getCookie("AccessToken")}`
		},
		body: JSON.stringify({ profileId: userID })
	});

	if (!data.ok) {
		throw new Error("Failed to fetch data");
	}
	const otherDataResult = await data.json()
	return (otherDataResult)
}

async function fillPropsPlayers(propsContext: any) {
	if (propsContext.props.player1ID === 'bot') {
		propsContext.props.player1Name = "bot";
		propsContext.props.player1Avatar = "/bot_" + propsContext.props.mode + ".jpg";
	} else
		await getData(propsContext.props.player1ID).then((data) => {
			propsContext.props.player1Name = data.nickname;
			propsContext.props.player1Avatar = data.avatar;
		}
		).catch((e) => console.log(e))

	if (propsContext.props.player2ID === 'bot') {
		propsContext.props.player2Name = "bot";
		propsContext.props.player2Avatar = "/bot_" + propsContext.props.mode + ".jpg";
	} else
		await getData(propsContext.props.player2ID).then((data) => {
			propsContext.props.player2Name = data.nickname;
			propsContext.props.player2Avatar = data.avatar;
		}
		).catch((e) => console.log(e))
}

function PlayPingPong() {
	const canvasContext = useCanvasContext();
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const router = useRouter();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const startTime = useRef<number>(Date.now());
	const [currentTime, setCurrentTime] = useState<string>("--:--");

	const [message, setMessage] = useState<string>("loading...");

	useEffect(() => {
		async function Start() {
			// fill propsContext players
			await fillPropsPlayers(propsContext);
			// load font
			await Text.loadFont();
			// load asset texture
			if (propsContext.props.scene !== "none")
				await CanvasComponent.loadAsset(propsContext.props.scene);
			// set canvas
			canvasContext.canvas = canvasRef.current;
			if (!canvasContext.canvas || !canvasRef.current) {
				throw new Error("Canvas not defined");
			}
			webContext.socketGame.emit("readyCanvas");
			setMessage("loading done");
		}

		Start();
		return () => {
			console.log("PlayPingPong unmount");
			// reset canvas
			canvasContext.canvas = null;
		};
	}, []);

	const interval = setInterval(() => {
		if (optionsContext.options.startPlay) {
			const time = (Date.now() - startTime.current) / 1000;
			const hour = Math.floor(time / 3600);
			const min = Math.floor(time / 60);
			const sec = Math.floor(time % 60);

			setCurrentTime(`${hour === 0 ? '' : '0' + hour + ':'}${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec} `);
		}

		if (optionsContext.options.endGame) {
			clearInterval(interval);
		}
	}, 1000 / 60);

	const leave = async () => {
		webContext.socketGame.emit("leaveInvite");
	};

	const leaveGame = async () => {
		if (optionsContext.options.startPlay) {
			if (!optionsContext.options.invite) {
				console.log('leaveGame');
				webContext.socketGame.emit("leaveGame");
			}
			else if (optionsContext.options.invite) {
				await leave();
			}
		}
	};

	return (
		<div className="Game">
			<canvas ref={canvasRef} id="PingPong"></canvas>
			<div className="section1">
				<div className="player p-right">
					<img src={propsContext.props.player2Avatar} alt="player-right" />
				</div>
				<div className="player p-left game-font">
					<h3>{propsContext.props.player2Name}</h3>
				</div>
				<div className="mid-sec game-font">
					<h3>{currentTime}</h3>
				</div>
				<div className="player p-right game-font">
					<h3>{propsContext.props.player1Name}</h3>
				</div>
				<div className="player p-left">
					<img src={propsContext.props.player1Avatar} alt="player-left" />
				</div>
			</div>
			<div className='section2'>
				<div className='center-sec'>
					{!optionsContext.options.startPlay && (
						<div className="waiting">
							<h3>{message}</h3>
						</div>
					)}
				</div>
			</div>

			<div className="section3">
				<IonIcon icon={IonIcons.logOutOutline} onClick={leaveGame} />
			</div>
		</div >
	);
}

export default PlayPingPong;
