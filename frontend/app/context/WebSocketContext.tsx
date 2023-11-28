// 'use client'; // This comment seems unnecessary and might be a typo.

// import { createContext, useContext, useState, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { DefaultEventsMap } from '@socket.io/component-emitter';

// export interface IWebSocketContext {
// 	game: Socket<DefaultEventsMap, DefaultEventsMap>;
// }

// // Create context
// const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

// function useWebSocketContext() {
// 	const context = useContext(WebSocketContext);

// 	if (!context) {
// 		throw new Error('WebSocket context not defined');
// 	}

// 	return context;
// }

// async function WebSocketContextProvider({ children }: { children: React.ReactNode }) {
// 	const [socketGame, setSocketGame] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

// 	useEffect(() => {
// 		const connectToGame = async () => {
// 			try {
// 				const gameIO = await io('http://localhost:3001', {
// 					transports: ['websocket'],
// 					query: {
// 						// accessToken: localStorage.getItem('accessToken'),
// 						accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYW5ham1pIiwiaWF0IjoxNzAwODMzOTcwLCJleHAiOjE3MDA5MjAzNzB9.jq_2aRCdzc6u6rdvN-s0rYmFUU9Nm2nygEYtSwT4Vz0',
// 					},
// 				});

// 				setSocketGame(gameIO);

// 				gameIO.once('connect', () => {
// 					console.log(gameIO.id, 'Connected to namespace: /ping-pong');
// 				});

// 				console.log('gameIO:', gameIO);

// 				return () => {
// 					// Clean up the game connection when the component unmounts
// 					console.log('Disconnect from namespace: /ping-pong');
// 					// gameIO.close();
// 				};
// 			} catch (error) {
// 				console.error('Error connecting to WebSocket:', error);
// 			}
// 		};

// 		const initializeWebSocket = async () => {
// 			const cleanup = await connectToGame();
// 			return cleanup;
// 		};

// 		initializeWebSocket();

// 		// No dependencies in the dependency array, so this effect runs once on mount.
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, []);

// 	const contextValue: IWebSocketContext = {
// 		game: socketGame as Socket<DefaultEventsMap, DefaultEventsMap>,
// 	};

// 	console.log('contextValue.game:', contextValue.game);

// 	if (!contextValue.game || !socketGame) {
// 		throw new Error('WebSocket context null');
// 	}

// 	return (
// 		<WebSocketContext.Provider value={contextValue}>
// 			{children}
// 		</WebSocketContext.Provider>
// 	);
// }

// export { useWebSocketContext, WebSocketContextProvider };


'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export interface IWebSocketContext {
	// chat: Socket<DefaultEventsMap, DefaultEventsMap>;
	// setChat: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
	game: Socket<DefaultEventsMap, DefaultEventsMap>;
	setGame: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
}

//create context
const WebSocketContext = createContext<IWebSocketContext | undefined>(undefined);

function useWebSocketContext() {
	const context = useContext(WebSocketContext);

	if (context === undefined) {
		throw new Error('WebSocket context not defined');
	}

	return context;
}

function WebSocketContextProvider({ children }: { children: React.ReactNode }) {

	// const chat = io('http://localhost:3001/chat', {
	// 	transports: ['websocket'],
	// 	query: {
	// 		// accessToken: localStorage.getItem('accessToken'),
	// 		accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidXNyYXNkZmFzZGYiLCJpYXQiOjE3MDA1MDI5NjUsImV4cCI6MTcwMDUwNjU2NX0.5urxB2V-1FAm40cmCgjQJxoQW5XWxD-eyrtoA02ZCVQ',
	// 	}
	// });

	const game = io('http://localhost:3001', {
		transports: ['websocket'],
		query: {
			// accessToken: localStorage.getItem('accessToken'),
			accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYW5ham1pIiwiaWF0IjoxNzAxMTczMzIzLCJleHAiOjE3MDEyNTk3MjN9.eLXtTkNrcH1rwlzO6a_KHhgRnlHuUmCbPoWQ3vSfmbE',
		}
	});

	// const [socketChat, setsocketChat] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(chat);
	const [socketGame, setsocketGame] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(game);

	// useEffect(() => {

	// 	chat.on('connect', () => {
	// 		console.log(chat.id, ' Connected to namespace: /chat');
	// 	});

	// 	game.on('connect', () => {
	// 		console.log(game.id, ' Connected to namespace: /ping-pong');
	// 	});

	// 	return () => {
	// 		// Clean up the game connection when the component unmounts
	// 		console.log('disconnect from namespace: /chat and /ping-pong');
	// 		game.disconnect();
	// 		chat.disconnect();
	// 	};

	// }, [game, chat]);

	const contextValue: IWebSocketContext = {
		// chat: socketChat,
		// setChat: setsocketChat,
		game: socketGame,
		setGame: setsocketGame,
	};

	return (
		<WebSocketContext.Provider value={contextValue}>
			{children}
		</WebSocketContext.Provider>
	);
}

export {
	useWebSocketContext,
	WebSocketContextProvider
};