'use client';

import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import { useState } from 'react';

function SettingPingPong() {
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const [isButtonClicked, setButtonClicked] = useState(false);

	const [devMode, setDevMode] = useState(propsContext.props.devMode);
	const [mode, setMode] = useState(propsContext.props.mode);
	const [refraction, setRefraction] = useState(propsContext.props.refraction);
	const [geometry, setGeometry] = useState(propsContext.props.geometry);


	const changeDevMode = () => {
		if (propsContext.props.devMode === 'none') {
			propsContext.props.devMode = 'camera';
		} else if (propsContext.props.devMode === 'camera') {
			propsContext.props.devMode = 'paddle-bot';
		} else if (propsContext.props.devMode === 'paddle-bot') {
			propsContext.props.devMode = 'all';
		} else if (propsContext.props.devMode === 'all') {
			propsContext.props.devMode = 'none';
		}
		setDevMode(propsContext.props.devMode)
	}

	const changeMode = () => {
		if (propsContext.props.mode === "easy") {
			propsContext.props.mode = "medium";
		} else if (propsContext.props.mode === "medium") {
			propsContext.props.mode = "hard";
		} else {
			propsContext.props.mode = "easy";
		}
		setMode(propsContext.props.mode)
	}

	const changeRefraction = () => {
		propsContext.props.refraction = !propsContext.props.refraction
		setRefraction(propsContext.props.refraction)
	}

	const changeGeometry = () => {
		propsContext.props.geometry = propsContext.props.geometry === "cube" ? "sphere" : "cube"
		setGeometry(propsContext.props.geometry)
	}

	const joinGame = () => {
		console.log("joinGame");

		webContext.socketGame.emit("joinGame", {
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
		});

		setButtonClicked(true);
	};

	const invitePlayer = () => {
		console.log("invitePlayer");

		webContext.socketGame.emit("invitePlayer", {
			playerId: "playerId",
		});

		setButtonClicked(true);
	}

	return (
		<div className="Settings" id="Settings">
			{
				// if npm run dev then show devMode button else hide
				process.env.NODE_ENV === "development" && (
					/* change dev mode on(true) off(false) */
					<button id="Button" onClick={changeDevMode}>DevMode {devMode}</button>
				)
			}

			{propsContext.props.playerType === "bot" && (
				/* change mode three modes easy medium hard */
				<button id="Button" onClick={changeMode}>Mode {mode}</button>
			)}

			{/* change refraction on(true) off(false) */}
			<button id="Button" onClick={changeRefraction}>Refraction {refraction ? "on" : "off"}</button>

			{/* change geometry cube(sphere) */}
			<button id="Button" onClick={changeGeometry}>Geometry {geometry}</button>

			{!optionsContext.options.invite ? (
				/* join game */
				<button id="Button" onClick={joinGame} disabled={isButtonClicked}>Join Game</button>
			) : (
				/* start game */
				<button id="Button" onClick={invitePlayer} disabled={isButtonClicked}>Proceed</button>
			)
			}
		</div >
	);
}

export default SettingPingPong;
