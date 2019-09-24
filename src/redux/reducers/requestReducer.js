import { GET_UUID, REQUEST_LOAD, REQUEST_SUCCESS, REQUEST_FAIL } from '../actions/types';

const initialState = {
	isLoading: false,
}

export default function(state = initialState, action) {
	switch(action.type) {
		case REQUEST_LOAD:
			return {
				...state,
				isLoading: action.payload
			}

		case REQUEST_FAIL:
			return {
				...state,
				isLoading: action.payload.isLoading,
			}

		case REQUEST_SUCCESS:
			return {
				...state,
				isLoading: action.payload.isLoading,
			}

		default:
			return state;
	}
}