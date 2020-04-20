import { TEXTAREA_HANDLE_CHANGE } from '../actions/types';

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

		default:
			return state;
	}
}