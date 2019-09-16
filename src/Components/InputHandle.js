import React, {useState, useEffect} from 'react'
import axios from 'axios';
import {Redirect} from 'react-router-dom'

import FileUpload from './FileUpload'
import TextArea from './TextArea'
import Result from '../Containers/Result/Result'

const InputHandle = (props) => {
	const [file, setFile] = useState('');
	const [fileName, setFileName] = useState('Choose File');
	const [sequenceString, setSequenceString] = useState('');
	const [value, setValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async e => {
		let isPostSuccessful = false;
		setIsLoading(true);
		e.preventDefault();
		const formData = new FormData();
		let postResult;

		if(fileName === 'Choose File' && sequenceString === '') {
			alert("Input is empty...");
			setIsLoading(false);
			return;
		}

		// User uploads file. This will supercede textarea
		if(fileName !== 'Choose File') {
			formData.append('file', file);
			try {
				const res = await axios.post('/upload', formData, {
					headers: {
						'Content-Type': 'multiparts/form-data'
					}
				});
				postResult = res.data

				isPostSuccessful = true;
			} catch(err) {
				if(err.response.status === 500) {
					alert(err);
					alert('There was a problem with the server');
				} else if(err.response.status === 400) {
					alert(err.response.data);
				}
			} finally {
				setIsLoading(false);
			}
		}

		// Sequence specified in the textarea
		else {
			formData.append('seq', sequenceString)
			try {
				const res = await axios.post('/upload', formData, {
					headers: {
						'Content-Type': 'multiparts/form-data'
					}
				});
				isPostSuccessful = true;
			} catch(err) {
				if(err.response.status === 500) {
					console.log('There was a problem with the server');
					console.log(err);
				} else if(err.response.status === 400) {
					alert(err.response.data);
				}
			} finally {
				setIsLoading(false);
			}
		}

		if(isPostSuccessful) {
			props.route.history.push({
				pathname: '/result',
				state: {pred: postResult}
			})
		}
	}


	const handleChange = e => {
		const {name, value, files} = e.target

		if(name === 'sequenceString') {
			setSequenceString(value)
		} else if(name === 'fileupload') {
			const tmpFile = files[0]
			if(tmpFile) {
				setFile(files[0]);
				setFileName(files[0].name);
				setValue(value);
			}
		} else if(e.target.getAttribute('name') === 'reset') {
			setFile('');
			setFileName('Choose File');
			setValue('');
		}
	}

	return (
		<div>
			<div style={isLoading ? {display: 'none'} : {display: 'block'}}>
				<form onSubmit={handleSubmit}>
					<TextArea 
						sequenceString={sequenceString}
						handleChange={handleChange}
					/>
					<FileUpload 
						fileName={fileName}
						value={value}
						handleChange={handleChange}
					/>
					<input 
						type='submit'
						value='Predict!'
					/>
				</form>
			</div>
			<p style={isLoading ? {display: 'block'} : {display: 'None'}}>Loading...</p>
		</div>
	)
	

		
}

export default InputHandle