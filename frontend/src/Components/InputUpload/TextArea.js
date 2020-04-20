import React from 'react'
import { connect } from 'react-redux';
import { textareaHandleChange } from '../../redux/actions/textareaAction'

function TextArea(props) {
	// Redux actions
	const { textareaHandleChange } = props;

	// Redux state
	const { textareaInput } = props;

	return(
		<div>
			<div className="wrapper">
				<textarea 
					name="textareaInput"
					value={textareaInput}
					onChange={(e) => {textareaHandleChange(e)}}
					id="seq-textarea"
					rows="10"
					cols="120"
					/>
			</div>
		</div>
	)
}

const mapStateToProps = state => ({
	textareaInput: state.textArea.textareaInput
});

const mapDispatchToProps = {
	textareaHandleChange
};

export default connect(mapStateToProps, mapDispatchToProps)(TextArea)