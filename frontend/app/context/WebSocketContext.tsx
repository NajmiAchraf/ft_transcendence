'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export interface IWebSocketContext {
	webSocket: Socket<DefaultEventsMap, DefaultEventsMap>;
	setWebSocket: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap>>>;
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
	// const socket = io('http://localhost:3001', {
	// 	transports: ['websocket'],
	// });
	const socket = io('http://10.14.10.5:3001', {
		transports: ['websocket'],
		query: {
			accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoib2toaWFyIiwiaWF0IjoxNzAwNjU5OTkyLCJleHAiOjE3MDA3NDYzOTJ9.BA_oNiigZ8Y1Zs4djAIlmetLkv4NAIGYBgUgNoeNc2o',
		}
	});

	const [webSocket, setWebSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap>>(socket);

	// useEffect(() => {
	// 	return () => {
	// 		// Clean up the WebSocket connection when the component unmounts
	// 		webSocket.disconnect();
	// 	};
	// }, [webSocket]);

	webSocket.on('connect', () => {
		console.log('Connected!', webSocket.id);
	});

	const contextValue: IWebSocketContext = {
		webSocket,
		setWebSocket,
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
