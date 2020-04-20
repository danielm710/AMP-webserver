import { LOADING_STATUS, SHOULD_REDIRECT } from '../actions/types';

export const getLoadingStatus = (isLoading) => dispatch => {
	dispatch({
		type: LOADING_STATUS,
		payload: {
			isLoading: isLoading
		}
	})
}

export const getRedirectStatus = (shouldRedirect) => dispatch => {
	dispatch({
		type: SHOULD_REDIRECT,
		payload: {
			shouldRedirect: shouldRedirect
		}
	})
}