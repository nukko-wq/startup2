'use client'

import { useDispatch } from 'react-redux'
import { deleteWorkspace } from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch } from '@/app/store/store'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { PressEvent } from '@react-types/shared'

interface WorkspaceDeleteDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
	workspaceId: string
}

const WorkspaceDeleteDialog = ({
	isOpen,
	onOpenChange,
	workspaceId,
}: WorkspaceDeleteDialogProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async (e: PressEvent, close: () => void) => {
		if (isDeleting) return // 二重削除防止

		try {
			setIsDeleting(true)
			await dispatch(deleteWorkspace(workspaceId)).unwrap()
			close()
		} catch (error) {
			console.error('ワークスペースの削除に失敗しました:', error)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none relative">
						{({ close }) => (
							<>
								<Heading className="text-xl font-semibold leading-6 my-0 text-slate-700">
									ワークスペースの削除
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									このワークスペースを削除してもよろしいですか？この操作は取り消せません。
								</p>
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={close}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-none"
										isDisabled={isDeleting}
									>
										キャンセル
									</Button>
									<Button
										onPress={(e) => handleDelete(e, close)}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-none flex items-center gap-2"
										isDisabled={isDeleting}
									>
										{isDeleting ? '削除中...' : '削除'}
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

export default WorkspaceDeleteDialog
