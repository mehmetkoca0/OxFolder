## Backend Deployment Document

Operating system of server: Linux (Ubuntu)

Turn on port 80

```
apt update
apt install nginx
pip3 install --upgrade pip
pip install virtualenvwrapper
```

add the following environment into the config profile (`~/.bashrc`)

```
export WORKON_HOME=$HOME/.virtualenvs
VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
source /usr/local/bin/virtualenvwrapper.sh
```

Then `source ~/.bashrc` or restart terminal

```
mkvirtualenv --python=/usr/bin/python3 flask_env
```

to appoint a python interpreter and have a virtual environment of name `flask_env`

```
cd .virtualenvs
workon flask_env
pip install flask ... (other requirements)
```

Then create a directory and clone the backend repository.

Check `main.py` file. Make sure `app.run(host="0.0.0.0")`

```
-- into the backend directory
python main.py
```

Then, everything can be accessed on `<server_ip>:<port_number>` (default port is 5000) and ajax request can be made to this ip and port

**Make it into a production deployment intead of a development server (with alternative solutions)**

```
pip install uwsgi
```

editting `uwsgi.ini` (if not exist, create one)

```
[uwsgi]
# project directory
chdir			= <directory to backend>
# flask uwsgi file
wsgi-file	= <path>/main.py
# call-back app object
callable	= app
# Python virtual environment (virtual env created above)
home			= <path>/.virtualenvs/flask_env

# processes settings
# host process
master		= true
# max number of processes
processes	= <number you'd like to set>

http			= <port number for monitoring> (:5000 by default, and need to turn on the port)
```

Then start uwsgi

```
uwsgi --ini uwsgi.ini
```

