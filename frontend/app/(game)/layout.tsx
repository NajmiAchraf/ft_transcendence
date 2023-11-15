import './index.css'
import PropsContextProvider from './ping-pong/context/PropsContext'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<PropsContextProvider>
			<div className="div"> {children} </div>
		</PropsContextProvider>
	)
}
