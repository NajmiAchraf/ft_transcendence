"use client"
import React from 'react'

import './vanillacss.css'

import './globals.css'
import { Inter } from 'next/font/google'
import NavContextProvider from './(NavbarPages)/context/NavContext'
const inter = Inter({ subsets: ['latin'] })
import PrimaryChecks from './components/PrimaryChecks'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<title>PingPong</title>
			</head>
			<PrimaryChecks></PrimaryChecks>
			<NavContextProvider>
				<body className={inter.className}> {children} </body>
			</NavContextProvider>
		</html>
	)
}
