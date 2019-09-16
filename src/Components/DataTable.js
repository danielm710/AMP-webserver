import React from "react"
import Table from 'react-bootstrap/Table'

import Cell from './Cell'

class DataTable extends  React.Component {

	renderHeadingRow() {
		var headings = this.props.headings.map((heading, i) => {
			const keyName = heading + "_" + i.toString()
			return(
				<Cell header={true} content={heading} key={keyName}/>
			)
		})

		const headingRow = (
			<tr>
				{headings}
			</tr>
			)
		
		return headingRow
	}

	renderBodyRow() {
		var bodyContents = this.props.predictionResult.map((pred, i) => {
			const text = (<span style={{color: "green"}}>someText</span>)
			const fullSeq = pred.sequence
			const seqPlaceholder = (<a href="#">Click</a>)

			const keySeqId = pred.seqId + "_" + i.toString();
			const HMMId =  "hmm_" + i.toString();
			const lengthId =  "length_" + i.toString();
			const placeholderId = "ph_" + i.toString();


			const seq = pred.ampRegion.map(region => {
				return (
					<span
						style={ region.isAMP ? {color: 'red'} : {color: 'black'} }
					>
					{region.subSequence}
					</span>
				)
			})
			return(
				<tr key={pred.seqID}>
					<Cell content={pred.seqID} key={keySeqId}/>
					<Cell content={pred.HMM} key={HMMId}/>
					<Cell content={pred.length} key={lengthId}/>
					<Cell content={seqPlaceholder} key={placeholderId}/>
				</tr>
			)
		})

		return bodyContents
			
	}

	render() {	
		return(
			<Table striped bordered hover>
				<thead>
					{this.renderHeadingRow()}
				</thead>
				<tbody>
					{this.renderBodyRow()}
				</tbody>
			</Table>
		)
	}
}

export default DataTable