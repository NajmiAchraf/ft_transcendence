'use client';

import { ReactNode } from 'react'

import PropsContextProvider from '@/app/(game)/ping-pong/context/PropsContext'
import CanvasContextProvider from '@/app/(game)/ping-pong/context/CanvasContext'
import { WebSocketContextProvider } from '@/app/(game)/ping-pong/context/WebSocketContext'

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
