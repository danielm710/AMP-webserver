import React from 'react'

import DataTable from './DataTable'

class AMPpredictor extends React.Component {
	constructor(props) {
		super()
		this.state = {
			predictionResult: []
		}
	}

	componentDidMount() {
		//fetch('http://localhost:5000/api/data')
		//.then(response => response.json())
		//.then(data => {
		//	this.setState({
		//		predictionResult: data
		//	})
		//})
		//this.setState({predictionResult: this.props.pred)
		const data = this.props.pred
		this.setState({predictionResult: data})
	}

	render() {
		const headings = [
			'ID',
			'HMM',
			'Length',
			'Sequence'
		]

		return(
			<div>
				<DataTable
					headings={headings}
					predictionResult={this.state.predictionResult}
				/>
			</div>
		)
	}
}

export default AMPpredictor