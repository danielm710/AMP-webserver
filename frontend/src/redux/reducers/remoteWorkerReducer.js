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

const initialState = {
	isLoading: false,
	shouldRedirect: false,
	isWorkerQueued: false,
	isWorkerRunning: false,
	isWorkerDone: false,
	isWorkerFailed: false,
	workerMessages: [],
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

		case UPDATE_WORKER_QUEUE_STATUS:
			return {
				...state,
				isWorkerQueued: action.payload.isWorkerQueued
			}

		case UPDATE_WORKER_MESSAGES:
			return {
				...state,
				workerMessages: [ ...state.workerMessages, action.payload.message ],
			}

		case WORKER_DONE:
			return {
				...state,
				isWorkerDone: true,
				isWorkerRunning: false,
			}

		case WORKER_FAILED:
			return {
				...state,
				isWorkerFailed: true,
				isWorkerRunning: false,
			}

		case WORKER_RUNNING:
			return {
				...state,
				isWorkerRunning: true,
			}

		case RESET_SESSION:
			return {
				...initialState,
			}

		default:
			return state;
	}
}