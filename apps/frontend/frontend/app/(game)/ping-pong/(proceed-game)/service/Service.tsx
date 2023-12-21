'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Game from '@/app/(game)/ping-pong/game/Game';

import { GameStates, PlayStates } from '@/app/(game)/ping-pong/common/Common';

import { useCanvasContext } from '@/app/(game)/ping-pong/context/CanvasContext';
import { useOptionsContext } from '@/app/(game)/ping-pong/context/OptionsContext';
import { usePropsContext } from '@/app/(game)/ping-pong/context/PropsContext';
import { useWebSocketContext } from '@/app/(game)/ping-pong/context/WebSocketContext';

import { useNavContext } from '@/app/(NavbarPages)/context/NavContext';
import { whoami } from '@/app/components/PersonalInfo';

function Service(setGameState: (setGameState: GameStates) => void): void {
	const canvasContext = useCanvasContext();
	const optionsContext = useOptionsContext();
	const propsContext = usePropsContext();
	const webSocketContext = useWebSocketContext();
	const webSocketGame = webSocketContext.socketGame;

	const navContext = useNavContext();

	const router = useRouter();

	let playState: PlayStates = "readyPlay";

	let game: Game;
	let dataPlayer: any | undefined = undefined;

	const updateGameStates = (readyPlay: boolean, startPlay: boolean, endGame: boolean) => {
		optionsContext.options.readyPlay = readyPlay;
		optionsContext.options.startPlay = startPlay;
		optionsContext.options.endGame = endGame;
	};

	const initGame = () => {
		console.log('initGame => readyPlay: ', optionsContext.options.readyPlay, ' apply: ', playState);
		if (playState === "readyPlay") {
			playState = "startPlay";

			updateGameStates(true, false, false);

			if (game) {
				game.stop();
			}
			game = new Game(
				() => webSocketContext.socketGame,
				() => propsContext.props,
				() => canvasContext.canvas,
				() => dataPlayer
			);

			console.log('game.room: ', game.room);
		}
	};

	const runGame = () => {
		console.log('runGame => startPlay: ', optionsContext.options.startPlay, ' apply: ', playState);
		if (playState === "startPlay") {
			playState = "endPlay";

			updateGameStates(true, true, false);

			game.run();
		}
	};

	const stopGame = () => {
		console.log('stopGame => endGame: ', optionsContext.options.endGame, ' apply: ', playState);
		if (playState === "endPlay") {
			playState = "readyPlay";

			updateGameStates(false, false, true);

			game.stop();

			propsContext.props.player1ID = '0';
			propsContext.props.player2ID = '0';
			propsContext.props.player1Name = 'name';
			propsContext.props.player2Name = 'name';
			propsContext.props.player1Avatar = "/img3.png";
			propsContext.props.player2Avatar = "/img3.png";
		}
	};

	const winOrLoseGame = (win: boolean) => {
		console.log("winOrLoseGame => endGame: ", optionsContext.options.endGame);
		if (playState === "endPlay") {
			updateGameStates(true, true, true);

			win ? game.win() : game.lose();
		}
	};

	const handleConnect = () => {
		console.log('Connected to namespace: /ping-pong');
	};

	const handleDataPlayer = (data: any) => {
		console.log('dataPlayer: ', data);
		dataPlayer = data;
		propsContext.props.player1ID = data.player1Name;
		propsContext.props.player2ID = data.player2Name;
	};

	const handleAllowToPlay = (data: any) => {
		console.log('allowToPlay: ', data);
		setGameState("play");
	};

	const handleAllowToWait = (data: any) => {
		console.log('allowToWait: ', data);
		setGameState("wait");
	};

	const leave = async () => {
		// disconnect socket after leave
		webSocketGame.disconnect();

		let id: string = (await whoami() as string);
		if (id === undefined)
			id = navContext.id.toString();

		// redirect to home
		if (optionsContext.options.invite && id !== undefined)
			router.push("/chat/" + id);
		else
			router.push("/home");
	};

	const handleDenyToPlay = (data: any) => {
		console.log('denyToPlay: ', data.error);
		if (data.error) {
			alert(data.error);
			leave();
		}
	};

	const handleInvalidAccess = (data: any) => {
		console.log('invalidAccess: ', data.error);
		if (data.error) {
			alert(data.error);
			leave();
		}
	}

	const handleLeaveRoom = (data: any) => {
		console.log('leaveRoom: ', data);
		stopGame();
		setGameState("settings");
	};

	const handleLeaveQueue = (data: any) => {
		console.log('leaveQueue: ', data);
		setGameState("settings");
	};

	const handleRoomConstruction = (data: any) => {
		console.log('roomConstruction: ', data);
		initGame();
	};

	const handleStartPlay = (data: any) => {
		console.log('startPlay: ', data);
		runGame();
	};

	const handleRoomDestruction = (data: any) => {
		console.log('roomDestruction: ', data);
		stopGame();
		setGameState("settings");
	};

	const handleYouWin = (data: any) => {
		console.log('youWin: ', data);
		winOrLoseGame(true);
	};

	const handleYouLose = (data: any) => {
		console.log('youLose: ', data);
		winOrLoseGame(false);
	};

	useEffect(() => {
		webSocketGame.on('connect', handleConnect);
		webSocketGame.on('dataPlayer', handleDataPlayer);
		webSocketGame.on('allowToPlay', handleAllowToPlay);
		webSocketGame.on('allowToWait', handleAllowToWait);
		webSocketGame.on('denyToPlay', handleDenyToPlay);
		webSocketGame.on('invalidAccess', handleInvalidAccess);
		webSocketGame.on('leaveRoom', handleLeaveRoom);
		webSocketGame.on('leaveQueue', handleLeaveQueue);
		webSocketGame.on('roomConstruction', handleRoomConstruction);
		webSocketGame.on('startPlay', handleStartPlay);
		webSocketGame.on('roomDestruction', handleRoomDestruction);
		webSocketGame.on('youWin', handleYouWin);
		webSocketGame.on('youLose', handleYouLose);

		// Cleanup listeners on unmount
		return () => {
			console.log('Service unmount');
			webSocketGame.off('connect', handleConnect);
			webSocketGame.off('dataPlayer', handleDataPlayer);
			webSocketGame.off('allowToPlay', handleAllowToPlay);
			webSocketGame.off('denyToPlay', handleDenyToPlay);
			webSocketGame.off('invalidAccess', handleInvalidAccess);
			webSocketGame.off('leaveRoom', handleLeaveRoom);
			webSocketGame.off('leaveQueue', handleLeaveQueue);
			webSocketGame.off('roomConstruction', handleRoomConstruction);
			webSocketGame.off('startPlay', handleStartPlay);
			webSocketGame.off('roomDestruction', handleRoomDestruction);
			webSocketGame.off('youWin', handleYouWin);
			webSocketGame.off('youLose', handleYouLose);
		};
	}, [propsContext, canvasContext]);

	return;
}

export default Service;
