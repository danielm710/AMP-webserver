import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: 'auto',
			fontWeight: 'bold',
			fontSize: '18px',
			width: '100%',
			letterSpacing: '5px',
		},
	},
}));

function PredictButton() {
	const classes = useStyles();

	return(
		<div className="input-upload-predict-container">
			<div className={classes.root}>
				<Button variant="outlined" type="submit">Predict</Button>
			</div>
		</div>
	)
}

export default PredictButton