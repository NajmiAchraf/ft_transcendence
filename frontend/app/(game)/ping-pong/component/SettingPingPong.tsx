'use client';

import { useEffect } from 'react'

import { Text } from '../game/Board';

import { usePropsContext } from '../context/PropsContext';
import { useWebSocketContext } from '../../../context/WebSocketContext';

import { Props } from '../common/Common';

function SettingPingPong() {
	const webContext = useWebSocketContext();
	const propsContext = usePropsContext();

	useEffect(() => {

		propsContext.setProps({
			...propsContext.props
		} as Props);

		async function ChooseGame() {
			try {
				await Text.loadFont();

				webContext.webSocket.on('connect', () => {
					console.log('Connected!');
				});

			} catch (error) {
				console.error(error);
			}
		}

		ChooseGame();
	}, []);

	const setPlayerType = () => {
		propsContext.setProps({
			...propsContext.props,
			playerType: propsContext.props.playerType === "player" ? "bot" : "player"
		} as Props);
	}

	const setMode = () => {
		propsContext.setProps({
			...propsContext.props,
			mode: propsContext.props.mode === "easy" ? "medium" : propsContext.props.mode === "medium" ? "hard" : "easy"
		} as Props);
	}

	const setMirror = () => {
		propsContext.setProps({
			...propsContext.props,
			mirror: !propsContext.props.mirror
		} as Props);
	}

	const setGeometry = () => {
		propsContext.setProps({
			...propsContext.props,
			geometry: propsContext.props.geometry === "cube" ? "sphere" : "cube"
		} as Props);
	}

	const joinGame = () => {
		console.log("joinGame");

		propsContext.setProps({
			...propsContext.props,
			inGame: true
		} as Props);

		webContext.webSocket.emit("joinGame", {
			socketId: webContext.webSocket.id,
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
		});
	};

	return (
		<div className="Parent" id="Parent">
			{/* change playerType player bot */}
			<button id="Button" onClick={setPlayerType}>Player {propsContext.props.playerType}</button>
			{
				propsContext.props.playerType === "bot" ? (
					/* change mode three modes easy medium hard */
					<button id="Button" onClick={setMode}>Mode {propsContext.props.mode}</button>
				) : (
					<div></div>
				)
			}

			{/* change mirror on(true) off(false) */}
			<button id="Button" onClick={setMirror}>Mirror {propsContext.props.mirror ? "on" : "off"}</button>

			{/* change geometry cube(sphere) */}
			<button id="Button" onClick={setGeometry}>Geometry {propsContext.props.geometry}</button>

			{/* join game */}
			<button id="Button" onClick={joinGame}>Join Game</button>
		</div>
	);
}

export default SettingPingPong;
