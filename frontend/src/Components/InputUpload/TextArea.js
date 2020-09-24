import React from 'react'
import { connect } from 'react-redux';
import { textareaHandleChange } from '../../redux/actions/textareaAction'
import { TEXTAREA_PLACEHOLDER } from '../../Configs/Constants'

function TextArea(props) {
	// Redux actions
	const { textareaHandleChange } = props;

	// Redux state
	const { textareaInput } = props;

	return(
		<div className="input-upload-textarea-wrapper">
			<textarea
				className="input-upload-textarea"
				name="textareaInput"
				value={textareaInput}
				onChange={(e) => {textareaHandleChange(e)}}
				id="seq-textarea"
				placeholder={TEXTAREA_PLACEHOLDER}
				/>
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