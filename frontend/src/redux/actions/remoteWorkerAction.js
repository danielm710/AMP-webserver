import {
	LOADING_STATUS,
	SHOULD_REDIRECT,
	WORKER_DONE,
	WORKER_FAILED,
	WORKER_RUNNING,
	UPDATE_WORKER_QUEUE_STATUS,
	RESET_SESSION,
	UPDATE_WORKER_MESSAGES,
} from '../actions/types';

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

export const updateTaskQueueStatus = (status) => dispatch => {
	dispatch({
		type: UPDATE_WORKER_QUEUE_STATUS,
		payload: {
			isWorkerQueued: status,
		}
	})
}

export const trackWorkerStatus = (message) => dispatch => {
	// Initial state for status message
	if(message === '') {
		dispatch({
			type: RESET_SESSION
		})
		return
	}

	// Backend server will send 'Done!' if job is successfully complete
	if(message === "Done!") {
		dispatch({
			type: WORKER_DONE
		});
	} else if(message.toLowerCase().includes("error")) {
		dispatch({
			type: WORKER_FAILED
		})
	} else {
		dispatch({
			type: WORKER_RUNNING
		})
	}
	// When this action is called, queued task should've been consumed by the backend service...
	dispatch({
		type: UPDATE_WORKER_QUEUE_STATUS,
		payload: {
			isTaskQueued: false,
		}
	})
}

export const updateWorkerMessages = (message) => dispatch => {
	dispatch({
		type: UPDATE_WORKER_MESSAGES,
		payload: {
			message: message,
		}
	})
}

export const resetRemoteWorker = () => dispatch => {
	dispatch({
		type: RESET_SESSION,
	})
}