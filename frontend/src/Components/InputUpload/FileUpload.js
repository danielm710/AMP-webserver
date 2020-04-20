import React from 'react';
import { connect } from 'react-redux';

import FileUploadReset from './FileUploadReset'
import { fileUploadHandleChange } from '../../redux/actions/fileUploadAction';

function FileUpload(props) {
	// Redux states
	const { value } = props;
	// Redux actions
	const { fileUploadHandleChange } = props;

	// File upload input size limit
	// 200 MB
	const SIZE_LIMIT = 200 * 1024 * 1024;

	return(
		<div className="file-upload-outer-container">
			<div className="file-upload-inner-container file-upload">
				<input
					type="file"
					className="input"
					id="customFile"
					name="fileupload"
					onChange={(e) => {fileUploadHandleChange(e, SIZE_LIMIT)}}
					value={value}
				/>
			</div>
			<div className="file-upload-inner-container reset-upload">
				<FileUploadReset />
			</div>
		</div>
	)
	
}

const mapStateToProps = state => ({
	value: state.fileUpload.value
});

const mapDispatchToProps = {
	fileUploadHandleChange
};

export default connect(mapStateToProps, mapDispatchToProps)(FileUpload)