import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import uuid from 'uuid';
import axios from 'axios';

import OptionData from '../Data/OptionData';

import {
	updateFileUploadProgress,
	updateSubmitStatus,
	resetFileInput,
	setUid
} from '../../redux/actions/fileUploadAction';
import { resetTextarea } from '../../redux/actions/textareaAction';
import { updateTaskQueueStatus, resetRemoteWorker } from '../../redux/actions/remoteWorkerAction';
import { updateOptionList } from '../../redux/actions/optionAction';

import InputUploadMain from '../InputUpload/InputUploadMain';
import OptionMain from '../Options/OptionMain';
import TaskProgress from '../Progress/TaskProgress';
import PredictButton from '../InputUpload/PredictButton';

import { ENDPOINT_ROOT } from '../../Configs/api_config'

function MainDisplay(props) {
	// Redux state
	const {
		selectedOptions,
		file,
		fileName,
		textareaInput,
		uid,
		shouldRedirect,
	} = props;

	// redux actions
	const {
		updateOptionList,
		updateTaskQueueStatus,
		updateFileUploadProgress,
		updateSubmitStatus,
		resetFileInput,
		resetTextarea,
		resetRemoteWorker,
		setUid,
	} = props;

	useEffect(() => {
		updateOptionList(OptionData);
		setUid(uuid.v4());
	}, [])

	useEffect(() => {
		if(shouldRedirect === true) {
			props.route.history.push('/result?uid=' + uid)
		}

		// Clear input field as a clean up
		return(() => {
			resetFileInput();
			resetTextarea();
			resetRemoteWorker();
		});
	}, [shouldRedirect, uid, props.route.history])

	const handleSubmit = async e => {
		e.preventDefault();

		(async () => {
			const formData = new FormData();

			// Input not specified
			if(!file && textareaInput === '') {
				alert("Input is empty...");

				return
			}
			// Pass UUID to server as a part of formData
			// Can access it using req.body
			formData.append('uid', uid);
			// User uploads file. This will override textarea input
			if(file) {
				formData.append('file', file);
			} else { // Sequence specified in the textarea
				formData.append('seq', textareaInput)
			}

			// Add options
		 	// Key is same as the option label
		 	Object.keys(selectedOptions).forEach(k => {
		 		formData.append(k, selectedOptions[k])
		 	});

			// Handle POST request
			const endpoint = ENDPOINT_ROOT + '/upload'
			const config = {
				url: endpoint,
				method: 'post',
				data: formData,
				onUploadProgress: (progress) => {
					const { loaded, total } = progress;
					const percentageProgress = Math.floor((loaded/total) * 100);
					updateFileUploadProgress(percentageProgress);
				}
			}
			try {
				updateSubmitStatus(true);
				const res = await axios(config);
				updateTaskQueueStatus(true);
				updateSubmitStatus(false);
				// Update worker queue status
			} catch(err) {
				// Request made, but the server responded with a status code
				updateSubmitStatus(false);
				if(err.response) {
					if(err.response.status === 500) {
						alert('There was a problem with the server');
					} // Client side problems (e.g. wrong input format) 
					else if(err.response.status === 400) {
						alert(err.response.data);
					}
				} else if (err.request) {
					// The request was made but no response was received
					console.log(err.request)
				} else {
					// Something else happened
					console.log('Error', err.message);
				}
			}
		})();
	}

	return(
		<div>
			<form onSubmit={handleSubmit}>
				<InputUploadMain />
				<OptionMain />
				<PredictButton />
				<TaskProgress />
			</form>
		</div>
	)

}

const mapStateToProps = state => ({
	shouldRedirect: state.remoteWorker.shouldRedirect,
	uid: state.fileUpload.uid,
	file: state.fileUpload.file,
	fileName: state.fileUpload.fileName,
	textareaInput: state.textArea.textareaInput,
	selectedOptions: state.option.selectedOptions,
});

const mapDispatchToProps = {
	updateOptionList,
	updateTaskQueueStatus,
	updateFileUploadProgress,
	updateSubmitStatus,
	resetFileInput,
	resetTextarea,
	resetRemoteWorker,
	setUid,
};

export default connect(mapStateToProps, mapDispatchToProps)(MainDisplay);