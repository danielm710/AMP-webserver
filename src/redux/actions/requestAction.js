import axios from 'axios';
import uuid from 'uuid'

import { GET_UUID, REQUEST_LOAD, REQUEST_SUCCESS, REQUEST_FAIL } from './types';

export const makeRequest = (fileName, file, sequenceString) => async dispatch => {
	const formData = new FormData();
	const randID = uuid.v4();
	//const randID = 'trout'
	let postResult;

	// Set Loading to true
	dispatch({
		type: REQUEST_LOAD,
		payload: true
	})

	// Input not specified
	if(fileName === 'Choose File' && sequenceString === '') {
		alert("Input is empty...");
		dispatch({
			type: REQUEST_FAIL,
			payload: {
				isLoading: false,
			}
		})
		return false;
	}
	// Pass UUID to server as a part of formData
	// Can access it using req.body
	formData.append('uid', randID);
	// User uploads file. This will override textarea input
	if(fileName !== 'Choose File') {
		formData.append('file', file);
	} else { // Sequence specified in the textarea
		formData.append('seq', sequenceString)
	}

	// Handle POST request
	try {
		const res = await axios.post('/upload', formData, {
			headers: {
				'Content-Type': 'multiparts/form-data'
			}
		});
		dispatch({
			type: REQUEST_SUCCESS,
			payload: {
				isLoading: false,
			}
		});
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

		dispatch({
			type: REQUEST_FAIL,
			payload: {
				isLoading: false,
			}
		});

		return false
	}

	return {
		isSuccess: true,
		uuid: randID
	}
}