import React from 'react';

import OptionLabel from './OptionLabel';
import OptionHelp from './OptionHelp';
import OptionInputField from './OptionInputField';

/**
 * Container for each detail.
 */
export function OptionDetailsItem(props) {
	// label: input label
	// type: input type (e.g. number, text, dropdown)
	const { label, type, defaultValue, dropdownOption = [], hidden, min, max, step} = props

	return(
		<div className="option-detail-item-container" style={{display: (hidden) ? 'none' : 'flex'}}>
			<div className="option-label-help-outer">
				<OptionLabel label={label}/>
				<OptionHelp label={label}/>
			</div>
			<OptionInputField
				type={type}
				dropdownOption={dropdownOption}
				label={label}
				defaultValue={defaultValue}
				min={min}
				max={max}
				step={step}
				key={label}
			/>
		</div>
	)
}

export default OptionDetailsItem