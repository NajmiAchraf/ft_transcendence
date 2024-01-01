'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import "@/app/(game)/ping-pong.css";

function SettingPingPong() {
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const webContext = useWebSocketContext();

	const router = useRouter();

	const [isButtonClicked, setButtonClicked] = useState(true);

	const [devMode, setDevMode] = useState(propsContext.props.devMode);
	const [mode, setMode] = useState(propsContext.props.mode);
	const [side, setSide] = useState(propsContext.props.side);
	const [reflection, setReflection] = useState(propsContext.props.reflection);
	const [geometry, setGeometry] = useState(propsContext.props.geometry);
	const [scene, setScene] = useState(propsContext.props.scene);

	const allowToProceed = () => {
		if (optionsContext.options.invite)
			setButtonClicked(false);
	}

	useEffect(() => {
		webContext.socketGame.on("allowToProceed", allowToProceed);
		if (optionsContext.options.invite)
			webContext.socketGame.emit('checkInvitation');
		else
			setButtonClicked(false);

		return () => {
			webContext.socketGame.off("allowToProceed", allowToProceed);
		};
	}, []);

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

	const changeSide = () => {
		if (propsContext.props.side === "right") {
			propsContext.props.side = "left";
		} else {
			propsContext.props.side = "right";
		}
		setSide(propsContext.props.side)
	}

	const changeReflection = () => {
		propsContext.props.reflection = !propsContext.props.reflection
		setReflection(propsContext.props.reflection)
	}

	const changeGeometry = () => {
		propsContext.props.geometry = propsContext.props.geometry === "cube" ? "sphere" : "cube"
		setGeometry(propsContext.props.geometry)
	}

	const changeScene = () => {
		if (propsContext.props.scene === "dast") {
			propsContext.props.scene = "space";
		} else if (propsContext.props.scene === "space") {
			propsContext.props.scene = "nebula";
		} else if (propsContext.props.scene === "nebula") {
			propsContext.props.scene = "none";
		} else if (propsContext.props.scene === "none") {
			propsContext.props.scene = "dast";
		}
		setScene(propsContext.props.scene)
	}

	const joinGame = () => {
		console.log("joinGame");

		webContext.socketGame.emit("joinGame", {
			playerType: propsContext.props.playerType,
			mode: propsContext.props.mode,
			side: propsContext.props.side,
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

	const leave = async () => {
		// disconnect socket after leave
		webContext.socketGame.disconnect();

		router.push("/home");
	}

	return (

		<div className="setting">
			<div className="stg-section stg">
				<div className="background">

					{/* if npm run dev then show devMode button else hide*/}
					{process.env.NODE_ENV === "development" && (
						<div className="button-part">
							{/* change dev mode none all camera paddle-bot */}
							<button className="button-stg props" onClick={changeDevMode}>DevMode {devMode}</button>
						</div>
					)}

					{propsContext.props.playerType === "bot" && (
						<div className="button-part">
							{/* change mode three modes easy medium hard */}
							<button className="button-stg props" onClick={changeMode}>Mode {mode}</button>

							{/* side of the paddle you play with */}
							<button className="button-stg props" onClick={changeSide}>Side {side}</button>
						</div>
					)}

					<div className="button-part">
						{/* change reflection on(true) off(false) */}
						<button className="button-stg props" onClick={changeReflection}>Reflection {reflection ? "on" : "off"}</button>

						{/* change geometry cube(sphere) */}
						<button className="button-stg props" onClick={changeGeometry}>Geometry {geometry}</button>

						{/* change scene */}
						<button className="button-stg props" onClick={changeScene}>Scene {scene}</button>
					</div>

					<div className="button-part">

						{!optionsContext.options.invite ? (
							/* join game */
							<button className="button-stg execute" onClick={joinGame} disabled={isButtonClicked}> Join Game </button>
						) : (
							/* invite player */
							<button className="button-stg execute" onClick={invitePlayer} disabled={isButtonClicked}> Proceed </button>
						)}
						{/* leave to home */}
						<button className="button-stg execute" onClick={leave}> Leave </button>

					</div>
				</div>
			</div>
		</div>
	);
}

export default SettingPingPong;
