import {
	RESET_FILE_INPUT,
	FILEUPLOAD_HANDLE_CHANGE,
	SET_UID,
	UPDATE_PROGRESS,
	RESET_PROGRESS,
	UPDATE_SUBMIT_STATUS,
} from './types';
import { isFileSizeGood } from '../../Utils/fileUploadHelper';

export const resetFileInput = () => dispatch => {
	dispatch({
		type: RESET_FILE_INPUT
	});
};

export const fileUploadHandleChange = (SIZE_LIMIT, files) => dispatch => {
	if(isFileSizeGood(files, SIZE_LIMIT)) {
		dispatch({
			type: FILEUPLOAD_HANDLE_CHANGE,
			payload: {
				file: files[0],
				fileName: files[0].name,
			}
		});
		return
	}

	// If the file is too big, reset the input field
	dispatch({
		type: RESET_FILE_INPUT
	});
};

export const setUid = (uid) => dispatch => {
	dispatch({
		type: SET_UID,
		payload: {
			uid: uid
		}
	})
}

export const updateFileUploadProgress = (percentageProgress) => dispatch => {
	dispatch({
		type: UPDATE_PROGRESS,
		payload: {
			id: 1,
			progress: percentageProgress
		}
	})
}

export const updateSubmitStatus = (status) => dispatch => {
	dispatch({
		type: UPDATE_SUBMIT_STATUS,
		payload: {
			submitStatus: status,
		}
	})
}