
@echo off
start "weed volume1" weed volume -dir="data1" -max=1 -mserver="localhost:9333" -port=8080 &
start "weed volume2" weed volume -dir="data2" -max=1 -mserver="localhost:9333" -port=8081 &
