import React from 'react'

import Header from '../../Components/Header'
import NavbarComponent from '../../Components/NavbarComponent'
import ResultMain from '../../Components/Result/ResultMain'
import Footer from '../../Components/Footer'

function Result(props) {
	return(
		<div className="container">
        	<Header />
        	<NavbarComponent />
        	<ResultMain 
        		route={props}
        	/>
        	<Footer />
     	</div>
	)
}

export default Result