import { RESET_FILE_INPUT, FILEUPLOAD_HANDLE_CHANGE } from '../actions/types';

const initialState = {
	file: '',
	fileName: 'Choose File',
	value: ''
}

export default function(state = initialState, action) {
	switch(action.type) {
		case RESET_FILE_INPUT:
			return {
				...initialState
			}

		case FILEUPLOAD_HANDLE_CHANGE:
			return {
				...state,
				file: action.payload.file,
				fileName: action.payload.fileName,
				value: action.payload.value
			}

		default:
			return state;
	}
}