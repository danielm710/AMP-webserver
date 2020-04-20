import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import uuid from 'uuid'

import FileUpload from './FileUpload'
import FileUploadReset from './FileUploadReset'
import TextArea from './TextArea'
import TaskProgress from '../Progress/TaskProgress'

const InputHandle = (props) => {
	// Redux states
	const { file, fileName, textareaInput, shouldRedirect } = props;

	const [uid, setUid] = useState('')

	useEffect(() => {
		setUid(uuid.v4());
	}, [])

	useEffect(() => {
		if(shouldRedirect === true) {
			props.route.history.push('/result?uid=' + uid)
		}
	}, [shouldRedirect, uid])

	const handleSubmit = async e => {
		e.preventDefault();

		(async () => {
			const formData = new FormData();

			// Input not specified
			if(fileName === 'Choose File' && textareaInput === '') {
				alert("Input is empty...");

				return
			}
			// Pass UUID to server as a part of formData
			// Can access it using req.body
			formData.append('uid', uid);
			// User uploads file. This will override textarea input
			if(fileName !== 'Choose File') {
				formData.append('file', file);
			} else { // Sequence specified in the textarea
				formData.append('seq', textareaInput)
			}

			// Handle POST request
			try {
				const res = await axios.post('/upload', formData, {
					headers: {
						'Content-Type': 'multiparts/form-data'
					}
				});
				console.log(res.data)
			} catch(err) {
				// Request made, but the server responded with a status code
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

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<TextArea />
				<FileUpload />
				<FileUploadReset />
				<input 
					type='submit'
					value='Predict!'
				/>
			</form>
			<TaskProgress/>
		</div>
	)		
}

InputHandle.propTypes = {
	shouldRedirect: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
	file: state.fileUpload.file,
	fileName: state.fileUpload.fileName,
	textareaInput: state.textArea.textareaInput,
	shouldRedirect: state.request.shouldRedirect
});

export default connect(mapStateToProps, { })(InputHandle);