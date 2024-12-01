import { Plus } from 'lucide-react'
import React from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import SpaceCreateForm from './SpaceCreateForm'

interface CreateSpaceInWorkspaceProps {
	workspaceId: string
}

const CreateSpaceInWorkspace = ({
	workspaceId,
}: CreateSpaceInWorkspaceProps) => {
	// ワークスペース情報を取得
	const workspace = useSelector(
		(state: RootState) =>
			state.workspace.workspaces.find((w) => w.id === workspaceId) ||
			(state.workspace.defaultWorkspace?.id === workspaceId
				? state.workspace.defaultWorkspace
				: null),
	)

	return (
		<DialogTrigger>
			<Button
				data-drop-target
				className="space-create-button w-full text-left px-5 py-4 text-sm text-gray-400 hover:bg-gray-700 flex items-center gap-1 border border-gray-700 transition-all duration-200"
			>
				<Plus className="w-4 h-4" />
				<span>Add Space to {workspace?.name || 'Workspace'}</span>
			</Button>

			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none">
						{({ close }) => (
							<div>
								<h2 className="text-lg font-semibold mb-4">
									新しいスペースを作成
								</h2>
								<SpaceCreateForm workspaceId={workspaceId} onClose={close} />
							</div>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default CreateSpaceInWorkspace
