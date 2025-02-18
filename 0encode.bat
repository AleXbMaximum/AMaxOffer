terser AMaxOffer.js -o AMaxOffer_released.min.js ^
  --ecma 2020 ^
  --module ^
  --compress "drop_console=true,drop_debugger=true,pure_funcs=[\"console.error\",\"console.warn\"],passes=3,pure_getters=true,hoist_funs=true,hoist_vars=true,reduce_vars=true,collapse_vars=true,unsafe_arrows=true,unsafe_methods=true,unsafe_comps=true,unsafe_proto=true,unsafe_undefined=true" ^
  --mangle "toplevel=true" ^
  --mangle-props "regex=/^_/,keep_quoted=true,reserved=[\"_importantProperty\", \"_doNotMangle\"]" ^
  --comments "/@name|@version|@description|@match|@connect|@grant|==/"
