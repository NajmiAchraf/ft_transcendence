'use client';

import { ReactNode } from 'react'


import PropsContextProvider from '@/app/context/PropsContext'
import CanvasContextProvider from '@/app/context/CanvasContext'
import { WebSocketContextProvider } from '@/app/context/WebSocketContext'

import '@/app/(game)/ping-pong.css'

export default function RootLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<WebSocketContextProvider>
			<PropsContextProvider>
				<CanvasContextProvider>
					<div className="div"> {children} </div>
				</CanvasContextProvider>
			</PropsContextProvider>
		</WebSocketContextProvider>
	)
}
