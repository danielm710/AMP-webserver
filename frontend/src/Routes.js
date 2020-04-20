import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store'

import Home from './Containers/Home/Home'
import Result from './Containers/Result/Result'

const Routes = () => (
	<Provider store={store}>
		<Router>
			<Switch>
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