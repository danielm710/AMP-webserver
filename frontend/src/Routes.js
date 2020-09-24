import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store'

import Home from './Containers/Home/Home';
import About from './Containers/About/About';
import Contact from './Containers/Contact/Contact';
import Result from './Containers/Result/Result';

const Routes = () => (
	<Provider store={store}>
		<Router>
			<Switch>
				<Route exact path="/about" component={About} />
				<Route exact path="/contact" component={Contact} />
				<Route exact path="/" component={Home} />
				<Route 
					path="/:result" 
					component={Result} 
				/>
			</Switch>
		</Router>
	</Provider>
);

export default Routes;