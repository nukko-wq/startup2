import { Providers } from '@/app/providers'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'StartUp',
	description: 'StartUp',
	robots: {
		index: false,
		follow: false,
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="ja">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
