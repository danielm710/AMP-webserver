import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';

import {
	MODEL_EVALUE,
	DOMAIN_EVALUE,
	LENGTH_THRESHOLD,
} from '../../Configs/OptionLabels';

import {
	MODEL_EVALUE_HELP,
	DOMAIN_EVALUE_HELP,
	LENGTH_THRESHOLD_HELP,
} from '../../Configs/OptionHelpTexts';

export const getTooltipText = (label) => {
	switch(label) {
		case MODEL_EVALUE:
			return MODEL_EVALUE_HELP
		case DOMAIN_EVALUE:
			return DOMAIN_EVALUE_HELP
		case LENGTH_THRESHOLD:
			return LENGTH_THRESHOLD_HELP
		default:
			return ""
	}
}

const CustomToolTip = withStyles((theme) => ({
	tooltip: {
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 400,
		fontSize: '14px',
		border: '1px solid #dadde9',
	},
}))(Tooltip)

function OptionHelp(props) {
	const { label } = props;

	const tooltipText = getTooltipText(label)

	return(
		<CustomToolTip title={tooltipText} placement="top-start" arrow>
			<HelpOutlineOutlinedIcon/>
		</CustomToolTip>
	)
}

export default OptionHelp