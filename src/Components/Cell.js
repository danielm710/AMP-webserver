import React from 'react'

function Cell(props) {
	const cellMarkup = props.header ? (
		
		<th>
			{props.content}
		</th>
		)
		: (
		<td>
			{props.content}
		</td>
		)

	return(cellMarkup)
}

export default Cell