// performance.ts
export const measurePerformance = (actionName: string) => {
	const start = performance.now()
	return () => {
		const end = performance.now()
		console.log(`${actionName} took ${end - start}ms`)
	}
}
