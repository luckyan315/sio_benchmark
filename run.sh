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
slaver202="192.168.20.202"
slaver204="192.168.20.204"

# dest addr 
dest="192.168.20.203"

# dashboard http listen port 
dash_port=6666

# sio_benchmark listening port 
bench_port=9401

# action api
start="/start"
stop="/stop"

# query
query="n=$n&c=$c&t=$t&ioc=$ioc"

#hook quit 
trap "quit" TERM QUIT INT EXIT


quit() {
  trap - TERM QUIT INT EXIT

  echo "Stop slavers..."
  stop $slaver202
  # stop $slaver204

  exit 0
}

# start slaver sio_benchmark app
start() {
  slaver=$1
  if [ -z $slaver ]; then
    echo "Please pass dest slaver name! e.g.: start 192.168.20.203:3000"
    exit 1
  fi

  let "bench_port += 1"

  # pack cmd
  cmd=$(printf "http://%s:%s%s?%s&dest=ws://%s:%s" \
    "$slaver" "$dash_port" "$start" "$query" "$dest" "$bench_port")

  curl $cmd
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

DEBUG=benchmark:* ./bin/nb -n $n -c $c --ioc $ioc -t $t ws://$dest:$bench_port
start $slaver202
start $slaver204


