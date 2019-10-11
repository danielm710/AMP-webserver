import React from 'react'

function MainContentDisplay(props) {
	let clickable = false

	if(props.classPrefix === 'domain' ||
		props.classPrefix === 'displayAMP') {
		clickable = true
	}

	return (
		<span
			name={props.classPrefix}
			style={ {cursor: clickable ? 'pointer' : 'auto',
					textDecoration: clickable ? 'underline' : 'none'} }
			onClick={ props.handleClick ? e => props.handleClick(e) : () => {} }
		>
			{props.content}
		</span>
	)
}

export default MainContentDisplay