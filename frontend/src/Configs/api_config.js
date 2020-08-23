let baseEndpoint;

const hostname = window && window.location && window.location.hostname;

if(hostname == 'minswebsite.com') {
	baseEndpoint = 'http://minswebsite.com'
}
else {
	baseEndpoint = 'http://localhost'
}

export const ENDPOINT_ROOT = `${baseEndpoint}/api`