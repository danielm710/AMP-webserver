import React from 'react'

function OptionLabel(props) {
	// label passed as props
	const { label } = props || ""

	return(
		<span
			className="option-label"
		>
			{label}
		</span>
	)
}

export default OptionLabel