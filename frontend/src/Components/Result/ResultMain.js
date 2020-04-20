import React from 'react'
import queryString from 'query-string'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DataTable from './DataTable/DataTable'

class ResultMain extends React.Component {
	constructor(props) {
		super()
		this.state = {
			predictionResult: []
		}
	}

	componentDidMount() {
		const parsed = queryString.parse(this.props.route.location.search)
		const uid = parsed.uid
		const endPoint = '/api/prediction/' + uid

		fetch(endPoint)
		.then(response => response.json())
		.then(data => {
			this.setState({
				predictionResult: data
			})
		})

	}

	render() {
		return(
			<DataTable
				predictionResult={this.state.predictionResult}
			/>
		)
	}
}

ResultMain.propTypes = {
	predictionResult: PropTypes.array.isRequired

}

const mapStateToProps = state => ({
	predictionResult: state.request.data
})

export default connect(mapStateToProps)(ResultMain);