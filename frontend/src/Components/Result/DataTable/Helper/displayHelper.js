// Assume sorted
// Python script will sort the items
export function getMetadataObject(data) {
	const metadataList = []

	// Add probability information
	data.original.probabilityProfile.map((profile, i) => {
		const start = parseInt(profile.Start)
		const end = parseInt(profile.End)

		for (i=start; i < end; i++) {
			const metadata = {}
			if(metadataList[i] && i in metadataList[i]) {
				const prob = metadataList[i][i]
				metadataList[i][i] = [metadataList[i][i], profile.Probability].join(';')
			} else {
				var prob = profile.Probability
				metadata[i] = prob.toString()
				metadataList.push(metadata)
			}
		}
	})

	// Add HMM information
	if(data.original.hmm) {
		data.original.hmm.map((hmm, i) => {
			const start = parseInt(hmm.start)
			const end = parseInt(hmm.end)

			for (i = start; i < end; i++) {
				if(metadataList[i] && i in metadataList[i]) {
					metadataList[i].domain = hmm.domain
					metadataList[i].evalue = hmm.evalue
				} else {
					console.log("Unrecognized index. All indices should have been covered in the previous loop")
				}
			}
		})
	}
	
	return metadataList
}

export function getSeqObjects(metadataList, sequence) {
	let prevProbability = ''
	let currentProbability = ''
	let prevDomain = ''
	let currentDomain = ''
	let prevEvalue = ''
	let currentEvalue = ''

	let partialSequence = ''
	const seqObjects = []
	let seqObject = {}

	metadataList.map((metadata, idx) => {
		prevProbability = currentProbability
		prevDomain = currentDomain
		prevEvalue = currentEvalue
		const i = idx.toString()
		currentProbability = metadata[i]
		currentDomain = metadata.domain
		currentEvalue = metadata.evalue

		if(idx === 0) {
			partialSequence = sequence.substring(idx, idx+1)
		} else if(currentProbability !== prevProbability) {
			// Add HMMscan information if exist
			if(currentDomain && prevDomain) {
				seqObject.domain = currentDomain
				seqObject.evalue = currentEvalue
			// domain just ended; would've been caught in the next if statement
			} else if(!currentDomain && prevDomain) {
				seqObject.domain = prevDomain
				seqObject.evalue = prevEvalue
			}
			seqObject.sequence = partialSequence
			seqObject.probability = prevProbability
			seqObjects.push(seqObject)

			partialSequence = sequence.substring(idx, idx+1)
			seqObject = {}
		} else if(currentDomain !== prevDomain) {
			// Add HMMscan information if it changes from domain exist -> domain not exist
			if(!currentDomain) {
				seqObject.domain = prevDomain
				seqObject.evalue = prevEvalue
			}
			seqObject.sequence = partialSequence
			seqObject.probability = currentProbability
			seqObjects.push(seqObject)

			partialSequence = sequence.substring(idx, idx+1)
			seqObject = {}
		} else {
			partialSequence = partialSequence.concat(sequence.substring(idx, idx+1))
		}

		if(idx === Object.keys(metadataList).length - 1) {
			seqObject.sequence = partialSequence
			seqObject.probability = currentProbability
			seqObjects.push(seqObject)
		}
	})
			
	return seqObjects
}