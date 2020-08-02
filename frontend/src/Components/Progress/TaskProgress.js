import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getLoadingStatus, getRedirectStatus } from '../../redux/actions/loadingAction'

function TaskProgress(props) {
	let isLoading;
	let isDataDone;
	const [data, setData] = useState('');

	// Redux action
	const { getLoadingStatus, getRedirectStatus } = props;

	const endpoint = "http://localhost:8080"
	
	useEffect(() => {
		const socket = io.connect(endpoint);

		socket.on("error", err => {
			console.log("SocketIO error")
			console.log(err)
		})

		socket.on("connect", () => {console.log("SocketIO connected!")})

		socket.on("test", (data) => {setData(data.data)})

		// Clean up
		return () => {
			socket.off("test")
		}
	}, [])
	
	useEffect(() => {
		isLoading = (data === 'Done!' || data === '') ? false : true
		getLoadingStatus(isLoading)

		isDataDone = (data === 'Done!') ? true : false
		getRedirectStatus(isDataDone)

		return () => {
			
		}
	}, [data])
	
	return (
		<div>
			<p style={isLoading ? {display: 'block'} : {display: 'None'}}>Loading...</p>
			<p>Data is "{data}"</p>
		</div>
	)
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = {
	getLoadingStatus,
	getRedirectStatus
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskProgress);