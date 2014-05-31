#!/bin/bash

# Usage:

# total request number to be sent
n=1
# concurrency number, the same workers number
c=10
# clients number in per worker
ioc=10
# interval time for emitting(ms) in per worker
t=2000

# slaver servers
slaver_local="localhost"
slaver205="192.168.20.205"
slaver202="192.168.20.202"
slaver204="192.168.20.204"

# dest addr 
dest="localhost"
	
# dashboard http listen port 
dash_port=6666

# sio_benchmark listening port 

bench_port=3000

# action api
start="/start"
stop="/stop"

# query
query="n=$n&c=$c&t=$t&ioc=$ioc"

#hook quit 
trap "quit" TERM QUIT INT


quit() {
  trap - TERM QUIT INT

  echo "Stop slavers..."
  stop $slaver_local
  # stop $slaver202
  # stop $slaver204

  exit 0
}

# start slaver sio_benchmark app
start() {
  slaver=$1
  dest_port=$2
  if [ -z $slaver ] || [ -z $dest_port ]; then
    echo "Please pass dest slaver uri and port ! e.g.: start 192.168.20.203 3000"
    exit 1
  fi

  # pack cmd
  cmd=$(printf "http://%s:%s%s?%s&dest=ws://%s:%s" \
    "$slaver" "$dash_port" "$start" "$query" "$dest" "$dest_port")

  curl $cmd

  let "bench_port += 1"
}

# close all connectioned clients in sio_benchmark clusters
stop() {
  echo "stop $1 ..."
  slaver=$1
  if [ -z $slaver ]; then
    echo "Please pass slaver name! e.g.: stop 192.168.20.203:3000"
    exit 1
  fi

  # pack cmd
  cmd=$(printf "http://%s:%s%s" "$slaver" "$dash_port" "$stop")
  curl $cmd

}

########################################
####                                ####
####   socket.io benchmark tool     ####
####                                ####
####            v 0.1.0             ####
####                                ####
########################################

# start benchmarking

start $slaver_local
# start $slaver202
# start $slaver204

