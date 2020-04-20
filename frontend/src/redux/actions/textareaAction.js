import { TEXTAREA_HANDLE_CHANGE } from './types';

export const textareaHandleChange = (e) => dispatch => {
	const { value } = e.target

	dispatch({
		type: TEXTAREA_HANDLE_CHANGE,
		payload: {
			textareaInput: value
		}
	})
}