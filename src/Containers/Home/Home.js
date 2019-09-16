import React from 'react';

import NavbarComponent from '../../Components/NavbarComponent'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import InputHandle from '../../Components/InputHandle'

import './Home.css'

const Home = (props) => {
	console.log(process.env.PORT)
	return(
      <div className="container">
        <Header />
        <NavbarComponent />
        <InputHandle route={props}/>
        <Footer />
      </div>
    )
}

export default Home;
