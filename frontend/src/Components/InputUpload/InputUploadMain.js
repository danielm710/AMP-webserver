import React, { useEffect } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import uuid from 'uuid'

import TextArea from './TextArea';
import SampleInput from './SampleInput';
import DropZone from './DropZone'
import UploadedItemDisplay from './UploadedItemDisplay';
import FileUploadProgressBar from '../Progress/FileUploadProgressBar';

import './InputUploadStyle.css';

const InputHandle = (props) => {
	// Redux states
	const { fileProgress, isSubmitting } = props;

	let submittedFiles;
	if(isSubmitting === true && Object.keys(fileProgress).length > 0) {
		submittedFiles = Object.keys(fileProgress).map(fileID => {
			const progress = fileProgress[fileID].progress;

			return(
				<FileUploadProgressBar key={fileID} progress={progress} />
			)
		})
	}

	return (
		<div>
			<div className="input-upload-wrapper">
				<div className="input-upload-textarea-container">
					<TextArea />
					<SampleInput/>
				</div>
				<div className="input-upload-file-upload-container">
					<DropZone />
					<UploadedItemDisplay />
				</div>
			</div>
			{submittedFiles}
		</div>
	)		
}

const mapStateToProps = state => ({
	file: state.fileUpload.file,
	fileName: state.fileUpload.fileName,
	uid: state.fileUpload.uid,
	fileProgress: state.fileUpload.fileProgress,
	isSubmitting: state.fileUpload.isSubmitting,
	textareaInput: state.textArea.textareaInput,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(InputHandle);