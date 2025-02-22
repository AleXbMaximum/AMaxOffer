@echo off
cd /d "%~dp0"  REM Ensure we start from the current directory


echo. > 2encode\header.txt


setlocal enabledelayedexpansion
set "inHeader=true"

for /f "delims=" %%a in (2encode\AMaxOffer_released0.min.js) do (


    if "%%a"=="// @license    CC BY-NC-ND 4.0" set inHeader=false

    if !inHeader! == true (
        echo %%a >> 2encode\header.txt
    )
)

call 2encode\0encode0.bat

call 2encode\0encode1.bat

copy /b 2encode\header.txt+2encode\AMaxOffer_released1.min.js AMaxOffer_final.js
