#!/bin/bash

# Usage:
#     -n     <number>   total request number to be sent
#     -c     <number>   concurrency number, the same workers number
#     --ioc  <number>   clients number in per worker
#     -t     <number>   interval time for emitting(ms) in per worker
#     [ws://]hostname[:port]/path

# e.g:
#    DEBUG=benchmark:* ./bin/nb -n 1000 -c 10 --ioc 10 -t 2000 ws://localhost:3000

# config request
n=1
c=10
ioc=10
t=2000

# dest addr
dest="localhost"

# slaver servers
slaver202="192.168.20.202"
slaver204="192.168.20.204"

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
trap "quit" TERM QUIT INT EXIT


quit() {
  trap - TERM QUIT INT EXIT

  echo "Stop slavers..."
  stop slaver202
  stop slaver204

  exit 0
}

# start slaver sio_benchmark app
start() {
  slaver=$1
  if [ -z $slaver ]; then
    echo "Please pass dest slaver name! e.g.: start 192.168.20.203:3000"
    exit 1
  fi
  cmd=$(printf "http://%s:%s%s?%s&dest=ws://%s:%s" \
    "$slaver" "$dash_port" "$start" "$query" "$dest" "$bench_port")

  echo -e "\x1b[1;32mStart benchmarkding\x1b[m : $cmd"
}

# close all connectioned clients in sio_benchmark clusters
stop() {
  echo "stop $1 ..."
}

# Start
# DEBUG=benchmark:* ./bin/nb -n $n -c $c --ioc $ioc -t $t ws://$dest:$bench_port
start $slaver202
start $slaver204


# send ctrl cmd to slaver servers
# curl $(printf "http://%s:%s%s?%s&dest=ws://%s:%s" \
#   "$slaver202" "$dash_port" "$start" "$query" "$dest" "$bench_port")
# curl $(printf "http://%s:%s%s?%s&dest=ws://%s:%s" \
#   "$slaver204" "$dash_port" "$start" "$query" "$dest" "$bench_port")


