// performance.ts
export const measurePerformance = (actionName: string) => {
	const start = performance.now()
	const startEntries = performance.getEntriesByType('resource')

	return () => {
		const end = performance.now()
		const endEntries = performance.getEntriesByType('resource')
		const newEntries = endEntries.slice(startEntries.length)

		console.log(`${actionName}:
			Total Time: ${end - start}ms
			Network Requests: ${newEntries.length}
			Resources: ${newEntries.map((e) => e.name).join(', ')}
		`)
	}
}
