import {
	TEXTAREA_HANDLE_CHANGE,
	RESET_TEXTAREA,
	GENERATE_SAMPLE_INPUT,
} from './types';

import { TEXTAREA_PLACEHOLDER } from '../../Configs/Constants'

export const textareaHandleChange = (e) => dispatch => {
	const { value } = e.target

	dispatch({
		type: TEXTAREA_HANDLE_CHANGE,
		payload: {
			textareaInput: value
		}
	})
}

export const resetTextarea = () => dispatch => {
	dispatch({
		type: RESET_TEXTAREA
	})
}

export const generateSampleInput = () => dispatch => {
	dispatch({
		type: TEXTAREA_HANDLE_CHANGE,
		payload: {
			textareaInput: TEXTAREA_PLACEHOLDER
		}
	})
}