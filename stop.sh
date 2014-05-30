#!/bin/bash

# slaver servers
slaver_local="localhost"
<<<<<<< HEAD
# slaver202="192.168.20.202"
# slaver204="192.168.20.204"
=======
slaver202="192.168.20.202"
slaver204="192.168.20.204"
slaver205="192.168.20.205"
>>>>>>> origin/master

# dashboard http listen port 
dash_port=6666

# action api
stop="/stop"

# close all connectioned clients in sio_benchmark clusters
stop() {
  echo -n "stop $1 ..."
  slaver=$1
  if [ -z $slaver ]; then
    echo "Please pass slaver name! e.g.: stop 192.168.20.203:3000"
    exit 1
  fi

  # pack cmd
  cmd=$(printf "http://%s:%s%s" "$slaver" "$dash_port" "$stop")
  curl $cmd
}

# stop remote sio_benchmark apps
<<<<<<< HEAD
stop $slaver_local
# stop $slaver202
# stop $slaver204
=======
stop $slaver205 &
stop $slaver202 &
stop $slaver204 &
>>>>>>> origin/master
