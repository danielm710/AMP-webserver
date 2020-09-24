import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
	getLoadingStatus,
	getRedirectStatus,
	updateWorkerMessages,
	trackWorkerStatus,
} from '../../redux/actions/remoteWorkerAction';

import MessageHeader from './MessageHeader';
import Messages from './Messages';

import './TaskProgressStyle.css';

function TaskProgress(props) {
	let isLoading;
	let isDataDone;
	const [data, setData] = useState('');

	// Redux action
	const { getLoadingStatus, getRedirectStatus, updateWorkerMessages, trackWorkerStatus } = props;

	// Redux state
	const { uid } = props;
	
	useEffect(() => {
		if(uid) {
			const socket = io.connect();

			socket.emit("join", {room: uid})

			socket.on("error", err => {
				console.log("SocketIO error")
				console.log(err)
			})

			socket.on("connect", () => {console.log("SocketIO connected!")})

			socket.on("test", (data) => {
				setData(data.data)
				updateWorkerMessages(data.data)
				trackWorkerStatus(data.data)
			})

			// Clean up
			return () => {
				socket.emit("leave", {room: uid})
				socket.off("test")
				socket.disconnect()
			}
		}		
	}, [uid])
	
	useEffect(() => {
		isLoading = (data === 'Done!' || data === '') ? false : true
		getLoadingStatus(isLoading)

		isDataDone = (data === 'Done!') ? true : false
		getRedirectStatus(isDataDone)

		return () => {
			
		}
	}, [data])
	
	return (
		<div className="remote-worker-wrapper">
			<MessageHeader/>
			<Messages />
		</div>
	)
}

const mapStateToProps = state => ({
	uid: state.fileUpload.uid,
})

const mapDispatchToProps = {
	getLoadingStatus,
	getRedirectStatus,
	updateWorkerMessages,
	trackWorkerStatus,
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskProgress);