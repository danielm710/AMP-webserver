import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import uuid from 'uuid';

import Home from './Containers/Home/Home'
import Result from './Containers/Result/Result'

const Routes = () => (
	<Router>
		<Route exact path="/" component={Home} />
		<Route 
			path="/:result" 
			component={Result} 
		/>
	</Router>
);

export default Routes;