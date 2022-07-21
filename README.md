# AMP Web Server Wiki

## Prerequisites
1. Docker (1.13.0+) https://docs.docker.com/get-docker/
2. Docker-compose (3.0+) https://docs.docker.com/compose/install/

## Usage Guide

### Installation and Termination
1. Clone this repository (to the location you want to install the application)

   `git clone https://github.com/danielm710/AMP-webserver.git`
  
2. Run the following command to install and launch `AMP-webserver` app. This may take some time to run if running for the first time.

   *Make sure AMP-webserver is not already running!*

   *Note that once the above command is run, it will create and save Docker images. After the first installation, you can launch the app with the same command (it will take much less time since the app is already installed.)*

   `docker-compose up -d`

   The above command will launch the app in the background.

   If you want to launch the app in the foreground, use the following command instead. (you will see verbose messages if running in the foreground)

   `docker-compose up`

3. To cleanly exit the app, run the following command. (If running the app in the foreground, press `CTRL+c` to terminate the app first.)

   `docker-compose down`

4. Then, remove Docker data volumes used in `AMP-webserver` by running the command,

   `docker volume prune`

5. If you wish to uninstall the app, run the following command. It will remove the `AMP-webserver` Docker images. (you may need sudo/admin privilege)

   `docker image rm -f amp-webserver_prod_app amp-webserver_prod_backend amp-webserver_prod_worker`
   
### Usage
1. Open web browser, and navigate to `localhost:80` in the address bar.

2. You can populate the sample input and start analysis!

***Note: There are some known installation bugs. See the "Known Issues" section for dealing with the bugs if you ever encounter one***


## Known Issues

### Unable to start Docker

If you are unable to use Docker and Docker-Compose due to Permission issue, adding yourself under `docker` group in the system may solve the issue.

Follow the instruction below:

1. Check docker group exists in your system
```
cat /etc/group | grep docker
```
If the command above returns docker​ , proceed to Step 2.
If the command above returns nothing, you will need to create a group called docker in your system.
```
sudo groupadd docker
```
2. Add a user (yourself) to the docker group
```
sudo usermod -aG docker YOUR_USER_NAME
```
For example, if your user name is Foo, the command would be
```
sudo usermod -aG docker Foo
```
You can find your user name with the command, `whoami`.

3. Log out and re-log back in to apply the group setting.
4. Run `docker run hello-world` to test it's working.


### Installation Error

At the end of the installation, if you see a message like below,

```
Creating network "amp-webserver_default" with the default driver
Creating volume "amp-webserver_pipeline_volume" with default driver
Creating volume "amp-webserver_backend_node_module" with default driver
Creating amp-webserver_rabbit_1 ... done
Creating amp-webserver_prod_backend_1 ... error
Creating amp-webserver_prod_worker_1  ... 

ERROR: for amp-webserver_prod_backend_1  Cannot create container for service prod_backend: failed to create symlink: /var/lib/docker/volumes/amp-webserver_backend_node_module/_data/.bin/acorn: symlink ../acorn/bin/acorn /var/lib/docker/volumes/amp-webserver_backend_node_module/_data/.bin/acorn: fileCreating amp-webserver_prod_worker_1  ... done

ERROR: for prod_backend  Cannot create container for service prod_backend: failed to create symlink: /var/lib/docker/volumes/amp-webserver_backend_node_module/_data/.bin/acorn: symlink ../acorn/bin/acorn /var/lib/docker/volumes/amp-webserver_backend_node_module/_data/.bin/acorn: file exists
ERROR: Encountered errors while bringing up the project.
```

Restarting AMP-webserver should often solve the issue. `docker-compose up -d`.
