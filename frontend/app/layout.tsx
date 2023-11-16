import React from 'react'

import './globals.css'
import './vanillacss.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import PropsContextProvider from './context/PropsContext'
import CanvasContextProvider from './context/CanvasContext'
import { WebSocketContextProvider } from './context/WebSocketContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'PingPong',
	description: 'PingPong',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<React.StrictMode>
			<html lang="en">
				<WebSocketContextProvider>
					<PropsContextProvider>
						<CanvasContextProvider>
							<body className={inter.className}> {children} </body>
						</CanvasContextProvider>
					</PropsContextProvider>
				</WebSocketContextProvider>
			</html>
		</React.StrictMode>
	)
}
