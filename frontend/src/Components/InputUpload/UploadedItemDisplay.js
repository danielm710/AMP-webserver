import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FileUploadReset from './FileUploadReset';

export function UploadedItemDisplay(props) {
	// Redux state
	const { file, fileName } = props;

	const header = file ?
		"Uploaded file: "
		:
		""

	return(
		<div className="input-upload-uploaded-item-display" >
			{header}{fileName}
			<FileUploadReset/>
		</div>
	)
}

const mapStateToProps = state => ({
  fileName: state.fileUpload.fileName,
  file: state.fileUpload.file,
})

export default connect(mapStateToProps)(UploadedItemDisplay)