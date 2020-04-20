import { RESET_FILE_INPUT, FILEUPLOAD_HANDLE_CHANGE } from './types';
import { isFileSizeGood } from '../../Utils/fileUploadHelper'

export const resetFileInput = () => dispatch => {
	dispatch({
		type: RESET_FILE_INPUT
	});
};

export const fileUploadHandleChange = (e, SIZE_LIMIT) => dispatch => {
	const {name, value, files} = e.target;

	if(name === 'fileupload') {
		if(isFileSizeGood(files, SIZE_LIMIT)) {
			dispatch({
				type: FILEUPLOAD_HANDLE_CHANGE,
				payload: {
					file: files[0],
					fileName: files[0].name,
					value: value
				}
			});
			return
		}

		// If the file is too big, reset the input field
		dispatch({
			type: RESET_FILE_INPUT
		});
		
	}	else if(e.target.getAttribute('name') === 'reset') {
		dispatch({
			type: RESET_FILE_INPUT
		})
	}
};