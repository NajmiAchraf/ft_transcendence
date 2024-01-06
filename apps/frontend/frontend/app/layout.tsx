import React from 'react'

import './vanillacss.css'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavContextProvider from './(NavbarPages)/context/NavContext'
const inter = Inter({ subsets: ['latin'] })
import PrimaryChecks from './components/PrimaryChecks'
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
		<html lang="en">
			<PrimaryChecks></PrimaryChecks>
			<NavContextProvider>
				<body className={inter.className}> {children} </body>
			</NavContextProvider>
		</html>
	)
}
