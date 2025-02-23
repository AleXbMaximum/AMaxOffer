@echo off
cd /d "%~dp0"  REM Ensure we start from the current directory


echo. > 2minifiy\header.txt


setlocal enabledelayedexpansion
set "inHeader=true"

for /f "delims=" %%a in (2minifiy\AMaxOffer_released0.min.js) do (


    if "%%a"=="// @license    CC BY-NC-ND 4.0" set inHeader=false

    if !inHeader! == true (
        echo %%a >> 2minifiy\header.txt
    )
)

call 2minifiy\0encode0.bat

call 2minifiy\0encode1.bat

copy /b 2minifiy\header.txt+2minifiy\AMaxOffer_released1.min.js AMaxOffer_Released.js
