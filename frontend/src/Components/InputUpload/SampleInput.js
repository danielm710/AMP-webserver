import React from 'react';
import { connect } from 'react-redux';

import { generateSampleInput } from '../../redux/actions/textareaAction';

function SampleInput(props) {
	// Redux actions
	const { generateSampleInput } = props;

	return(
		<div className="sample-input-container">
			<span
				className="clickable"
				onClick={()=>{generateSampleInput()}}
			>
			Generate sample input!
			</span>
		</div>
	)
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = {
	generateSampleInput,
};

export default connect(mapStateToProps, mapDispatchToProps)(SampleInput);