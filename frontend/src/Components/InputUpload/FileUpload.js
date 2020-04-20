import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { fileUploadHandleChange } from '../../redux/actions/fileUploadAction';

function FileUpload(props) {
	// Redux states
	const { value } = props;
	// Redux actions
	const { fileUploadHandleChange } = props;

	// File upload input size limit
	// 200 MB
	const SIZE_LIMIT = 20 * 1024 * 1024;

	return(
		<Fragment>
			<div className="custome-file">
				<input
					type="file"
					className="input"
					id="customFile"
					name="fileupload"
					onChange={(e) => {fileUploadHandleChange(e, SIZE_LIMIT)}}
					value={value}
				/>
			</div>
		</Fragment>
	)
	
}

const mapStateToProps = state => ({
	value: state.fileUpload.value
});

const mapDispatchToProps = {
	fileUploadHandleChange
};

export default connect(mapStateToProps, mapDispatchToProps)(FileUpload)