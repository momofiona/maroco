
@echo off
:: windows 上不能省略 -mdir 不然找不到临时目录，无法上传文件
start "weed master" weed master -mdir="./"
::可能需要等3秒
::TIMEOUT /T 3 /NOBREAK
start "weed volume1" weed volume -dir="data1" -max=1 -mserver="localhost:9333" -port=8080 &
start "weed volume2" weed volume -dir="data2" -max=1 -mserver="localhost:9333" -port=8081 &
