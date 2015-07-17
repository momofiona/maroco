
@echo off
start "weed volume1" weed volume -dir="data1" -max=5 -mserver="localhost:9333" -publicUrl="192.168.30.1:8851" -port=8080 &
start "weed volume2" weed volume -dir="data2" -max=10 -mserver="localhost:9333" -publicUrl="192.168.30.1:8852" -port=8081 &
