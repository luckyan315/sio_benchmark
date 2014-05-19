Socket.io benchmarking tool
=============

A benchmark tool aimed at stress testing scale nodes which consist by node.js + socket.io(pre2) + socket.io-redis

## Usage
```script
$cd ./sio_benchmark
$DEBUG=benchmark:* ./bin/nb -n 1000 -c 10 --ioc 10 ws://localhost:3000
```
