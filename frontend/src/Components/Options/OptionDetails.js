import React from 'react'
import { connect } from 'react-redux';

import OptionDetailsItem from './OptionDetailsItem';

/**
 * Container for detail view for each type of option: basic and advanced.
 */
export function OptionDetails(props) {
	// String specifying which type of option it is (e.g. basicOptions or advancedOptions)
	// These can be used to access respective items in the redux state
	const { optionType } = props

	// Redux state
	const { options } = props

	let optionDetails;
	if(options[optionType]) {
		optionDetails = options[optionType].keys.map(k => {
			const id = optionType + "_" + k
			return(
				<OptionDetailsItem
					label={options[optionType].entities[k].label}
					type={options[optionType].entities[k].type}
					dropdownOption={options[optionType].entities[k].dropdownOption}
					defaultValue={options[optionType].entities[k].defaultValue}
					hidden={options[optionType].entities[k].hidden}
					min={options[optionType].entities[k].min}
					max={options[optionType].entities[k].max}
					step={options[optionType].entities[k].step}
					key={id}
				/>
			)
		})
	} else {
		optionDetails = []
	}

	return(
		<div className="option-detail-container">
			{optionDetails}
		</div>
	)
}

const mapStateToProps = state => ({
	options: state.option.options
})

export default connect(mapStateToProps)(OptionDetails) 