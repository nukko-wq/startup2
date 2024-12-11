// performance.ts
export const measurePerformance = (actionName: string) => {
	const start = performance.now()
	const startEntries = performance.getEntriesByType('resource')

	return () => {
		const end = performance.now()
		const endEntries = performance.getEntriesByType('resource')
		const newEntries = endEntries.slice(startEntries.length)

		const metrics = newEntries.map((entry) => {
			const resourceEntry = entry as PerformanceResourceTiming
			return {
				name: resourceEntry.name,
				duration: resourceEntry.duration,
				startTime: resourceEntry.startTime,
				dnsTime:
					resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart,
				connectTime: resourceEntry.connectEnd - resourceEntry.connectStart,
				ttfb: resourceEntry.responseStart - resourceEntry.requestStart,
			}
		})

		console.log(`${actionName}:
			Total Time: ${end - start}ms
			Network Requests: ${newEntries.length}
			Detailed Metrics: ${JSON.stringify(metrics, null, 2)}
			`)
	}
}
