import React from 'react';

import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MainDisplay from '../../Components/MainDisplay/MainDisplay';

import './Home.css'

const Home = (props) => {
	return(
      <div className="site-container">
        <Header />
        <MainDisplay route={props}/>
        <Footer />
      </div>
    )
}

export default Home;
