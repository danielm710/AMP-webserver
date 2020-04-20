import React from 'react';

import NavbarComponent from '../../Components/NavbarComponent'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import InputUploadMain from '../../Components/InputUpload/InputUploadMain'

import './Home.css'

const Home = (props) => {
	return(
      <div className="container">
        <Header />
        <NavbarComponent />
        <InputUploadMain route={props}/>
        <Footer />
      </div>
    )
}

export default Home;
