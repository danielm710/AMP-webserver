import { combineReducers } from 'redux';
import requestReducer from './requestReducer'
import fileUploadReducer from './fileUploadReducer'
import textareaReducer from './textareaReducer'

export default combineReducers({
	request: requestReducer,
	fileUpload: fileUploadReducer,
	textArea: textareaReducer
})