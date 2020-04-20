import { TEXTAREA_HANDLE_CHANGE, RESET_TEXTAREA } from './types';

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