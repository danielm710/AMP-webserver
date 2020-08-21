#server {
#    listen 80;
#
#    server_name minswebsite.com www.minswebsite.com;
#
#    location / {
#        proxy_http_version 1.1;
#        proxy_pass http://docker-app;
#    }
#}

server {
	listen 80;
  	listen [::]:80;

    #server_name minswebsite.com www.minswebsite.com;

    location / {
    	root /usr/share/nginx/html;
    	index index.html;
    	try_files $uri $uri/ /index.html;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        break;
    }

    location ~* \.(eot|otf|ttf|woff|woff2)$ {
        add_header Access-Control-Allow-Origin *;
    }
            
    location ~ /api/(?<url>.*) {
        proxy_pass http://backend/$url;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://backend/socket.io/;
    }
}