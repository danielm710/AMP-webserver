import React from 'react'
//import ReactDOM from 'react-dom'

function ExpandedItem(props) {
	const sideClassName = "header " + "side-" + props.classPrefix
	const bodyClassName = "body " + "main-" + props.classPrefix
	const sideKey = "side_" + props.classPrefix + "_" + props.id
	const mainKey = "main_" + props.classPrefix + "_" + props.id
	
	return([	
			<div
				className={sideClassName}
				key={sideKey}
				style={ {display: props.mainContent ? 'inline' : 'None'} } 
			>
				{props.sideContent}
			</div>,
			<div
				className={bodyClassName}
				name={props.classPrefix}
				key={mainKey}
				style={ {display: props.mainContent ? 'inline' : 'None'} }
			>
				{props.mainContent}
			</div>
	])
}

export default ExpandedItem