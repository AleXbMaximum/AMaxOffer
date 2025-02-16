terser AMaxOffer.js -o AMaxOffer_released.min.js ^
  --compress "drop_console=true,drop_debugger=true,pure_funcs=[\"console.error\",\"console.warn\"]" ^
  --mangle ^
  --mangle-props "regex=/^_/,keep_quoted=true"  ^
  --comments "/@name|@version|@description|@match|@connect|@grant|==/"


