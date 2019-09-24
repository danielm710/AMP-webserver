import React from 'react'

import Header from '../../Components/Header'
import NavbarComponent from '../../Components/NavbarComponent'
import AMPpredictor from '../../Components/AMPpredictor'
import Footer from '../../Components/Footer'

function Result(props) {
	return(
		<div className="container">
        	<Header />
        	<NavbarComponent />
        	<AMPpredictor 
        		route={props}
        	/>
        	<Footer />
     	</div>
	)
}

export default Result