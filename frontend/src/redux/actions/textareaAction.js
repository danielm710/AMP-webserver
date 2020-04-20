import { TEXTAREA_HANDLE_CHANGE } from './types';

export const textareaHandleChange = (e) => dispatch => {
	const {name, value, files} = e.target

	dispatch({
		type: TEXTAREA_HANDLE_CHANGE,
		payload: {
			textareaInput: value
		}
	})
}