/**
 * Check if the uploaded file exceeds the size limit.
 */

export const isFileSizeGood = (files, sizeLimit) => {
	if(!files) {
		alert("File is not uploaded");

		return false
	}

	// Check file size
	// Currently, only takes a single file
	const megabytes = sizeLimit / (1024 * 1024)
	if(files[0].size >= sizeLimit) {
		alert(`File needs to be smaller than ${megabytes} Mb`);
		return false
	}

	return true
}