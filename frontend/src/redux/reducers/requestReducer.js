import { LOADING_STATUS, SHOULD_REDIRECT } from '../actions/types';

const initialState = {
	isLoading: false,
	shouldRedirect: false
}

export default function(state = initialState, action) {
	switch(action.type) {
		case LOADING_STATUS:
			return {
				...state,
				isLoading: action.payload.isLoading
			}

		case SHOULD_REDIRECT:
			return {
				...state,
				shouldRedirect: action.payload.shouldRedirect
			}

		default:
			return state;
	}
}