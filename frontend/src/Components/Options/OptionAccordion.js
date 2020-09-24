import React from 'react';
import { connect } from 'react-redux';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import OptionData from '../Data/OptionData';
import OptionDetails from './OptionDetails';

function OptionoAccordion(props) {
	// Redux state storing list of options
	const { options } = props

	let optionItems;

	if(options.optionList) {
		optionItems = OptionData.optionList.keys.map(k => {
			const optionEntity = OptionData.optionList.entities[k]

			return(
				<Accordion key={k} defaultExpanded={optionEntity.defaultExpanded}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1a-content"
						id="panel1a-header"
					>
						<p className="summary text">{optionEntity.summaryText}</p>
					</AccordionSummary>
		  	    <AccordionDetails >
		  	      <OptionDetails optionType={k}/>
		  	    </AccordionDetails>
				</Accordion>
			)
		});
	} else {
		optionItems = [];
	}	

	return (
		<div>
			{optionItems}
		</div>
	);
}

const mapStateToProps = state => ({
	options: state.option.options
})

export default connect(mapStateToProps)(OptionoAccordion)