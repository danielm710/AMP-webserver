import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import ContactMain from '../../Components/Contact/ContactMain';

function Contact(props) {
	return(
		<div className="site-container">
			<Header />
			<ContactMain/>
			<Footer />
		</div>
	)
}

export default Contact