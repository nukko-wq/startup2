import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import SpaceRenameForm from '@/app/features/space/components/SpaceRenameForm'

interface SpaceRenameDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
	spaceId: string
	workspaceId: string
	currentSpaceName: string
}

const SpaceRenameDialog = ({
	isOpen,
	onOpenChange,
	spaceId,
	workspaceId,
	currentSpaceName,
}: SpaceRenameDialogProps) => {
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay
				isDismissable
				className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur"
			>
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none">
						<h2 className="text-lg font-semibold mb-4">スペース名の変更</h2>
						<SpaceRenameForm
							spaceId={spaceId}
							workspaceId={workspaceId}
							initialName={currentSpaceName}
							onClose={() => onOpenChange(false)}
						/>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SpaceRenameDialog
