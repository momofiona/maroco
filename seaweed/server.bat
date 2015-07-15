
@echo off
:: windows 上不能省略 -mdir 不然找不到临时目录，无法上传文件
start "weed master" weed master -mdir="./"
::可能需要等3秒
::TIMEOUT /T 3 /NOBREAK
