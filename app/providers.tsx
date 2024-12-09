'use client'

import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import { store, persistor } from '@/app/store/store'
import { PersistGate } from 'redux-persist/integration/react'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// SSRの場合やマウント前は直接childrenを返す
	if (!mounted || typeof window === 'undefined' || !persistor) {
		return (
			<SessionProvider>
				<Provider store={store}>{children}</Provider>
			</SessionProvider>
		)
	}

	return (
		<SessionProvider>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					{children}
				</PersistGate>
			</Provider>
		</SessionProvider>
	)
}
