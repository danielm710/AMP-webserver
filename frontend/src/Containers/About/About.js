import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import AboutMain from '../../Components/About/AboutMain';

function About(props) {
	return(
		<div className="site-container">
			<Header/>
			<AboutMain />
			<Footer/>
		</div>
	)
}

export default About