'use client'

import { Pencil } from 'lucide-react'
import React from 'react'
import { Button, Form, Input, Text } from 'react-aria-components'
import HeaderMenu from './HeaderMenu'

const Header = () => {
	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="flex items-center gap-2">
				<Form className="flex items-center">
					<Input
						autoFocus
						className="text-xl font-bold pl-4 text-zinc-800 bg-transparent border-b-2 border-blue-500 outline-none"
						onFocus={(e) => {
							const input = e.target as HTMLInputElement
							const length = input.value.length
							input.setSelectionRange(length, length)
						}}
						onBlur={() => {
							// setIsEditing(false)
							// reset({ name: displayName })
						}}
					/>
				</Form>
				{/*
				<Button
					className="group flex items-center gap-2 hover:bg-zinc-100 rounded-lg px-2 py-1 outline-none"
					// onPress={() => setIsEditing(true)}
				>
					<Text className="text-xl font-bold pl-4 text-zinc-800">Untitled</Text>
					<Pencil className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
				</Button>
        */}
			</div>
			<HeaderMenu />
		</div>
	)
}

export default Header
