import {
	RESET_FILE_INPUT,
	FILEUPLOAD_HANDLE_CHANGE,
	SET_UID,
	UPDATE_PROGRESS,
	RESET_PROGRESS,
	UPDATE_SUBMIT_STATUS,
} from '../actions/types';

const initialState = {
	file: undefined,
	fileName: 'File not uploaded...',
	value: '',
	uid: '',
	fileProgress: {},
	isSubmitting: false,
}

export default function(state = initialState, action) {
	switch(action.type) {
		case RESET_FILE_INPUT:
			return {
				...state,
				file: initialState.file,
				fileName: initialState.fileName,
				fileProgress: initialState.fileProgress,
			}

		case FILEUPLOAD_HANDLE_CHANGE:
			return {
				...state,
				file: action.payload.file,
				fileName: action.payload.fileName,
				value: action.payload.value
			}

		case SET_UID:
			return {
				...state,
				uid: action.payload.uid,
			}

		case UPDATE_PROGRESS:
			return {
				...state,
				fileProgress: {
					...state.fileProgress,
					[action.payload.id]: {
						...state.fileProgress[action.payload.id],
						progress: action.payload.progress
					}
				}
			}

		case UPDATE_SUBMIT_STATUS:
			return {
				...state,
				isSubmitting: action.payload.submitStatus
			}

		default:
			return state;
	}
}