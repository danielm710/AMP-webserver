import React, { Fragment, useState } from 'react'

function FileUpload(props) {
	return(
		<Fragment>
			<div className="custome-file">
				<input
					type="file"
					className="input"
					id="customFile"
					name="fileupload"
					onChange={props.handleChange}
					value={props.value}
				/>
				
				<span
					className="reset-upload"
					name="reset"
					onClick={props.handleChange}
				> 
					x
				</span>
			</div>
		</Fragment>
	)
	
}

export default FileUpload