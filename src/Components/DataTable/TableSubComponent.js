import React from 'react'
import './subComponentStyle.css'
import ExpandedItem from './ExpandedItem'
import { getMetadataObject, getSeqObjects } from './Helper/displayHelper'
import MainContentDisplay from './MainContentDisplay'

class TableSubComponent extends React.Component {
	constructor(props) {
		super()
		this.state = {
			isHovered: false,
			targetProb: '',
			displayDomain: true,
			targetDomain: '',
			displayAMP: false
		}
		this.onMouseEnter = this.onMouseEnter.bind(this)
		this.onMouseLeave = this.onMouseLeave.bind(this)
		this.handleClick = this.handleClick.bind(this)
	}
	
	onMouseEnter(e) {
		this.setState({isHovered: true})

		const probs = e.target.getAttribute('prob')
		const splitProb = probs.split(';')
		const lastIdx = splitProb.length - 1
		const targetProb = splitProb[lastIdx]

		this.setState({targetProb: targetProb})
	}

	onMouseLeave() {
		this.setState({isHovered: false})
		this.setState({targetProb: ''})
	}
	
	handleClick(e) {
		let name = e.target.getAttribute('name')
		if(name === 'domain') {
			this.setState(prevState => {
				return {
					displayDomain: !prevState.displayDomain
				}
			})
		} else if(name === 'displayAMP') {
			this.setState(prevState => {
				return {
					displayAMP: !prevState.displayAMP
				}
			})
		}	
	}

	getSpanObjects(seqObjects, data) {
		let counter = 0
		const seq = seqObjects.map((seqObject, i) => {
			let isHmm = false
			const seqID = data.original.seqID
			const id = seqID + "_span_" + counter.toString()
			counter = counter + 1
			
			const isBold = this.state.isHovered && seqObject.probability.includes(this.state.targetProb)
			if(seqObject.domain) {
				isHmm = this.state.displayDomain && seqObject.domain.includes(this.state.targetDomain)
			}

			const splitProb = seqObject.probability.split(';')
			let meetThreshold = false
			for(i = 0; i< splitProb.length; i++) {
				const prob = parseFloat(splitProb[i])
				if(prob >= 50) {
					meetThreshold = true
					break
				}
			}

			const isAMP = this.state.displayAMP && meetThreshold
			return(
				<span 
					prob={seqObject.probability}
					key={id}
					domain={seqObject.domain ? seqObject.domain : ''}
					evalue={seqObject.evalue ? seqObject.evalue : ''}
					style={{ display: 'inline-block', 
							fontWeight: isBold ? 'bold' : 'normal',
							color: isHmm ? '#9400D3' : 'black',
							fontSize: isHmm ? '18px': '16px',
							backgroundColor: isAMP ? '#ADFF2F' : 'transparent'
							}
					}
					onMouseEnter={e => this.onMouseEnter(e)}
					onMouseLeave={this.onMouseLeave}
				>
					{seqObject.sequence}
				</span>

			)
		})

		return seq
	}

	render() {
		const data = this.props.tableData
		const metadataList = getMetadataObject(data)
		const seqObjects = getSeqObjects(metadataList, data.original.sequence)

		return(
			<div className='subComponent-wrap'>
				<ExpandedItem 
					classPrefix='domain'
					sideContent='Known AMP Families: '
					mainContent={<MainContentDisplay
									content={data.row.domain}
									handleClick={this.handleClick}
									classPrefix='domain'
								/>}
					id={data.original.seqID}
					handleClick={this.handleClick}
				/>
				
				<ExpandedItem 
					classPrefix='evalue'
					sideContent='E-value: '
					mainContent={data.row.evalue}
					id={data.original.seqID}
				/>

				<ExpandedItem 
					classPrefix='seq'
					sideContent='Sequence: '
					mainContent={this.getSpanObjects(seqObjects, data)}
					id={data.original.seqID}
				/>

				<ExpandedItem 
					classPrefix='length'
					sideContent='Sequence Length: '
					mainContent={data.row.length}
					id={data.original.seqID}
				/>

				<ExpandedItem 
					classPrefix='displayAMP'
					sideContent='Display AMP Region: '
					mainContent={data.row.maxProb >= 0.5
								?
								<MainContentDisplay
									content='Display'
									handleClick={this.handleClick}
									classPrefix='displayAMP'
								/>
								:
								''
								}
					id={data.original.seqID}
				/>

				<ExpandedItem 
					classPrefix='probability'
					sideContent='Probability: '
					mainContent={this.state.targetProb}
					id={data.original.seqID}
				/>

				<ExpandedItem 
					classPrefix='isAMP'
					sideContent='AMP: '
					mainContent={data.row.maxProb >= 0.5 ? "Yes" : "No"}
					id={data.original.seqID}
				/>
				
			</div>
		)
	}		
}

export default TableSubComponent