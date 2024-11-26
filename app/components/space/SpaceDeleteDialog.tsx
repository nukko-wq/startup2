import { AlertTriangle } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { deleteSpace } from '@/app/features/space/spaceSlice'
import type { AppDispatch } from '@/app/store/store'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'

interface SpaceDeleteDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
	spaceId: string
	workspaceId: string
}

const SpaceDeleteDialog = ({
	isOpen,
	onOpenChange,
	spaceId,
	workspaceId,
}: SpaceDeleteDialogProps) => {
	const dispatch = useDispatch<AppDispatch>()

	const handleDelete = async (close: () => void) => {
		try {
			await dispatch(deleteSpace({ spaceId, workspaceId })).unwrap()
			close()
		} catch (error) {
			console.error('Failed to delete space:', error)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog role="alertdialog" className="outline-none relative">
						{({ close }) => (
							<>
								<Heading
									slot="title"
									className="text-xl font-semibold leading-6 my-0 text-slate-700"
								>
									スペースの削除
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									このスペースを削除してもよろしいですか？この操作は取り消せません。
								</p>
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={close}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-none"
									>
										キャンセル
									</Button>
									<Button
										onPress={() => handleDelete(close)}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-none"
									>
										削除
									</Button>
								</div>
							</>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SpaceDeleteDialog
