import React from "react"
import Table from 'react-bootstrap/Table'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

import TableSubComponent from './TableSubComponent'


class DataTable extends  React.Component {
	constructor() {
		super()
	}

	renderBodyRow() {
		const data = []
		
		this.props.predictionResult.forEach((pred, i) => {
			const tmp = {}
			tmp.seqID = pred.seqID
			tmp.length = pred.length
			tmp.sequence = pred.sequence

			let evalue
			let domain
			// if HMM information exists
			if(pred.HMM) {
				const domains = []
				const evalues = []
				pred.HMM.forEach((hmm, i) => {
					domains.push(hmm.domain)
					evalues.push(hmm.evalue)
				})
				evalue = evalues.join(' ')
				domain = domains.join(' ')
			}

			// Parse probability information
			const probs = []
			pred.probabilityProfile.map((probRegion, i) => {
				probs.push(probRegion.Probability)
			})

			tmp.evalue = evalue
			tmp.domain = domain
			tmp.hmm = pred.HMM
			tmp.probabilityProfile = pred.probabilityProfile
			tmp.ampRegion = pred.ampRegion
			tmp.maxProb = Math.round(Math.max(...probs)) * 0.01

			data.push(tmp)
		})
		return data			
	}

	render() {
		const containerStyles = {'margin': 'auto'}

		let columns = [{
			Header: '',
			accessor: 'expand',
			width: 30,
			expander: true
		}, {
			Header: 'ID',
			accessor: 'seqID',
			style: {'textAlign': 'center',
					'margin': 'auto'}
		}, {
			Header: 'Max Probability',
			accessor: 'maxProb',
			style: {'textAlign': 'center',
					'margin': 'auto'}
		},{
			Header: 'Known AMP Families',
			headerClassName: 'amp-families',
			columns: [{
				Header: 'Domain',
				accessor: 'domain',
				style: {'textAlign': 'center',
					'margin': 'auto'}
			}, {
				Header: 'E-value',
				accessor: 'evalue',
				style: {'textAlign': 'center',
					'margin': 'auto'}
			}]
		}, {
			Header: 'Sequence',
			accessor: 'sequence',
			columns: [{
				Header: 'Length',
				accessor: 'length',
				style: {'textAlign': 'center',
					'margin': 'auto'}
			}]
		}]

		return(
			<div style={containerStyles}>
					<ReactTable
						columns={columns}
						data={this.renderBodyRow()}
						className="-highlight"
						SubComponent={data => {
						    return (
						      <TableSubComponent 
						      	tableData={data}						      	
						      />
						    )
						}}
					/>
			</div>
		)
	}
}

export default DataTable