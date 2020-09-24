import { combineReducers } from 'redux';
import remoteWorkerReducer from './remoteWorkerReducer';
import fileUploadReducer from './fileUploadReducer';
import textareaReducer from './textareaReducer';
import optionReducer from './optionReducer';

export default combineReducers({
	remoteWorker: remoteWorkerReducer,
	fileUpload: fileUploadReducer,
	textArea: textareaReducer,
	option: optionReducer,
})