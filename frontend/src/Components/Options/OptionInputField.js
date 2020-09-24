import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import { selectOptions } from '../../redux/actions/optionAction';

export function OptionInputField(props) {
	const { type, dropdownOption = [], label, defaultValue, min, max, step } = props;

	// Redux state
	const { options, selectedOptions } = props;

	// Redux action
	const { selectOptions } = props;

	let inputField;
	// Initially update redux state with the default value 
	useEffect(() => {
		selectOptions(label, defaultValue)
	}, [options])

	if(type === "number") {
		// To enable min, max, step in input tag
		const inputProps = {
			min: min,
			max: max,
			step: step,
		};
		let value = selectedOptions[label] || 0;
		inputField = <TextField
										type={type}
										fullWidth={true}
										value={value}
										variant="outlined"
										onChange={e => {selectOptions(label, e.target.value)}}
										inputProps={inputProps}
									>
									</TextField>
	} else if(type === "text") {
		let value = selectedOptions[label] || '';
		inputField = <TextField
										type={type}
										fullWidth={true}
										value={value}
										variant="outlined"
										onChange={e => {selectOptions(label, e.target.value)}}
									>
									</TextField>
	}

	return(
		<div className="option-input-container">
			{inputField}
		</div>
	)
}

const mapStateToProps = state => ({
	selectedOptions: state.option.selectedOptions,
	options: state.option.options
})

const mapDispatchToProps = { selectOptions }

export default connect(mapStateToProps, mapDispatchToProps)(OptionInputField)