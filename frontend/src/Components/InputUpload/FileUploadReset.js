import React from 'react';
import { connect } from 'react-redux';
import { resetFileInput } from '../../redux/actions/fileUploadAction';

function FileUploadRemove(props) {
	// Redux actions
	const { resetFileInput } = props;

	return (
		<span
			className="reset-upload-button"
			name="reset"
			onClick={resetFileInput}
		> 
			x
		</span>
	)
}

const mapStateToProps = state => ({
	
});

const mapDispatchToProps = {
	resetFileInput
};

export default connect(mapStateToProps, mapDispatchToProps)(FileUploadRemove)