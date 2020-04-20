import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { fileUploadHandleChange } from '../../redux/actions/fileUploadAction';

function FileUploadRemove(props) {
	// Redux actions
	const { fileUploadHandleChange } = props;

	return (
		<span
			className="reset-upload"
			name="reset"
			onClick={(e) => {fileUploadHandleChange(e)}}
		> 
			x
		</span>
	)
}

const mapStateToProps = state => ({
	
});

const mapDispatchToProps = {
	fileUploadHandleChange
};

export default connect(mapStateToProps, mapDispatchToProps)(FileUploadRemove)