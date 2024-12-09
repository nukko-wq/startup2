'use client'

import { useRef } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store/store'
import { hideSpaceList } from '@/app/features/overlay/overlaySlice'
import { Overlay, useModalOverlay, FocusScope } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'

const SpaceListOverlay = () => {
	const dispatch = useDispatch<AppDispatch>()
	const ref = useRef<HTMLDivElement>(null)
	const state = useOverlayTriggerState({
		isOpen: true,
		onOpenChange: (isOpen) => {
			if (!isOpen) {
				dispatch(hideSpaceList())
			}
		},
	})

	const { modalProps, underlayProps } = useModalOverlay(
		{
			isDismissable: true,
		},
		state,
		ref,
	)

	return (
		<Overlay>
			<div className="fixed inset-0 z-50 bg-slate-900/30" {...underlayProps}>
				<FocusScope contain restoreFocus autoFocus>
					<div className="flex h-full items-center justify-center">
						<div
							{...modalProps}
							ref={ref}
							className="bg-zinc-50 rounded-xl shadow-lg outline-none"
							tabIndex={-1}
						>
							<div className="w-[320px] p-4">
								<p>スペースリスト</p>
							</div>
						</div>
					</div>
				</FocusScope>
			</div>
		</Overlay>
	)
}

export default SpaceListOverlay
