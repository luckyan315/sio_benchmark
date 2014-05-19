Socket.io benchmarking tool
=============

A benchmark tool aimed at stress testing scale nodes which consist by node.js + socket.io(pre2) + socket.io-redis

## Usage
```script
Usage:
    -n     <number>   total request number to be sent
    -c     <number>   concurrency number, the same workers number
    --ioc  <number>   clients number in per worker
    [ws://]hostname[:port]/path

e.g:
   DEBUG=benchmark:* ./bin/nb -n 1000 -c 10 --ioc 10 ws://localhost:3000
```
