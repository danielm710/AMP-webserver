import { TEXTAREA_HANDLE_CHANGE, RESET_TEXTAREA } from '../actions/types';

const initialState = {
	textareaInput: '',
}

export default function(state = initialState, action) {
	switch(action.type) {
		case TEXTAREA_HANDLE_CHANGE:
			return {
				...state,
				textareaInput: action.payload.textareaInput
			}

		case RESET_TEXTAREA:
			return {
				...initialState
			}

		default:
			return state;
	}
}