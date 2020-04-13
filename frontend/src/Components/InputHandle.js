import React, { useState } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FileUpload from './FileUpload'
import TextArea from './TextArea'
import { makeRequest } from '../redux/actions/requestAction'
import { isFileSizeGood } from '../helper/fileHelper'

const InputHandle = (props) => {
	const [file, setFile] = useState('');
	const [fileName, setFileName] = useState('Choose File');
	const [sequenceString, setSequenceString] = useState('');
	const [value, setValue] = useState('');

	const resetFileInput = () => {
		setFile('');
		setFileName('Choose File');
		setValue('');
	}

	const handleSubmit = async e => {
		e.preventDefault();

		(async () => {
			const result = await props.makeRequest(fileName, file, sequenceString);

			// Redirect to result page is successful
			if(result.isSuccess) {
				//props.route.history.push('/result?uid=' + result.uuid)
			}
		})();
		
	}

	const handleChange = e => {
		const {name, value, files} = e.target

		if(name === 'sequenceString') {
			setSequenceString(value)
		} else if(name === 'fileupload') {
			const megabytes = 200;
			const sizeLimit = megabytes * 1024 * 1024;

			if(isFileSizeGood(files, sizeLimit)) {
				setFile(files[0]);
				setFileName(files[0].name);
				setValue(value);
			} else { // Reset state
				resetFileInput();
			}
		} else if(e.target.getAttribute('name') === 'reset') {
			resetFileInput();
		}
	}

	return (
		<div>
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
			<p style={props.isLoading ? {display: 'block'} : {display: 'None'}}>Loading...</p>
		</div>
	)		
}

InputHandle.propTypes = {
	makeRequest: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
}

const mapStateToProps = state => ({
	isLoading: state.request.isLoading,
})

export default connect(mapStateToProps, { makeRequest })(InputHandle);