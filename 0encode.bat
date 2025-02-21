call ./2encode/0encode0.bat
call ./2encode/0encode1.bat
copy /b ./2encode/header.txt+./2encode/AMaxOffer_released1.min.js ./2encode/AMaxOffer_final.js
move /Y AMaxOffer_Release.js ./2encode/AMaxOffer_released1.min.js
