import './index.css'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="div">{children}</div>
	)
}
