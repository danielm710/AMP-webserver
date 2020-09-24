import React from 'react';

import NavBarMain from './NavBar/NavBarMain';

function Header() {
  return(
      <header className="site-header">
      	<h1>AMPMiner: A Proteome-wide AMP Predictor</h1>
      	<NavBarMain/>
      </header>
    )
}

export default Header;
