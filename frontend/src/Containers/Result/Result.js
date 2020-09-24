import React from 'react'

import Header from '../../Components/Header'
import ResultMain from '../../Components/Result/ResultMain'
import Footer from '../../Components/Footer'

function Result(props) {
	return(
		<div className="site-container">
        	<Header />
        	<ResultMain 
        		route={props}
        	/>
        	<Footer />
     	</div>
	)
}

export default Result