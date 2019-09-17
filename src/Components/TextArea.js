import React from 'react'

function TextArea(props) {

	return(
		<div>
			<div className="wrapper">
				<textarea 
					name="sequenceString"
					value={props.sequenceString}
					onChange={props.handleChange}
					id="seq-textarea"
					rows="10"
					cols="120"
					/>
			</div>
		</div>
	)
}

export default TextArea