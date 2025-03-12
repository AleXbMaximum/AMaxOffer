@echo off
cd /d "%~dp0"  REM Ensure we start from the current directory

REM Clear or create header.txt
echo. > "2minifiy\header.txt"

setlocal enabledelayedexpansion
set "inHeader=true"

REM Minify the script using terser
call terser AMaxOffer.js -o "2minifiy\AMaxOffer_released0.min.js"  ^
  --compress "drop_console=true,drop_debugger=true,pure_funcs=[\"console.error\",\"console.warn\"],passes=3,pure_getters=true,hoist_funs=true,hoist_vars=true,reduce_vars=true,collapse_vars=true,unsafe_arrows=true,unsafe_methods=true,unsafe_comps=true,unsafe_proto=true,unsafe_undefined=true"   ^
  --mangle "toplevel=true"   ^
  --mangle-props "regex=/^_/,keep_quoted=true,reserved=[\"_importantProperty\", \"_doNotMangle\"]"   ^
  --comments "/@name|@license|@version|@description|@match|@connect|@grant|==/"


set "inHeader=true"

for /f "delims=" %%a in (AMaxOffer.js) do (

    if "%%a"=="// @license    CC BY-NC-ND 4.0" set inHeader=false

    if !inHeader! == true (
        echo %%a >> 2minifiy\header.txt
    )
)

for /f "tokens=1,* delims=:" %%a in ('findstr /n /C:"// @version" "2minifiy\header.txt"') do (
    set "versionLine=%%b"
    for /f "tokens=3 delims= " %%c in ("!versionLine!") do set "version=%%c"
)

REM Obfuscate the minified file
call javascript-obfuscator "2minifiy\AMaxOffer_released0.min.js" -o "2minifiy\AMaxOffer_released1.min.js" ^
  --target browser ^
  --seed 0 ^
  --disable-console-output true ^
  --self-defending false ^
  --debug-protection true ^
  --debug-protection-interval 4000 ^
  --domain-lock "https://global.americanexpress.com/*" ^
  --string-array true ^
  --string-array-rotate true ^
  --string-array-shuffle true ^
  --string-array-threshold 0.3 ^
  --string-array-index-shift true ^
  --string-array-indexes-type hexadecimal-numeric-string ^
  --string-array-wrappers-count 5 ^
  --string-array-wrappers-type function ^
  --string-array-wrappers-parameters-max-count 5 ^
  --string-array-wrappers-chained-calls true ^
  --string-array-encoding rc4 ^
  --split-strings true ^
  --identifier-names-generator mangled ^
  --compact false ^
  --simplify true ^
  --transform-object-keys true ^
  --numbers-to-expressions true ^
  --control-flow-flattening true ^
  --control-flow-flattening-threshold 0.3 ^
  --dead-code-injection true ^
  --dead-code-injection-threshold 0.3 ^
  --disable-console-output true ^
  --rename-globals true

copy /b .\2minifiy\header.txt+.\2minifiy\AMaxOffer_released1.min.js .\3github_release\raw\dist\AMaxOffer.user.js

copy /b .\2minifiy\header.txt+.\2minifiy\AMaxOffer_released1.min.js .\3github_release\raw\dist\Hist\AMaxOffer%version%.user.js
