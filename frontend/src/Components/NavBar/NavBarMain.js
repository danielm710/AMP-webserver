import React from 'react';
import {
  Link
} from "react-router-dom";

import './NavBarStyle.css';

function NavBarMain() {
	return(
		<div className="navbar-wrapper">
			<Link to="/" className="navbar-item">Home</Link>
			<Link to="/about" className="navbar-item">About</Link>
			<Link to="/contact" className="navbar-item">Contact</Link>
		</div>
	)
}

export default NavBarMain