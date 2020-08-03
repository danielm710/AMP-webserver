server {
        listen 80;

        server_name minswebsite.com www.minswebsite.com;

        location / {
                proxy_http_version 1.1;
		proxy_pass http://127.0.0.1:8080;
        }
}
