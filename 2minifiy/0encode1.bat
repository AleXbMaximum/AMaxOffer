javascript-obfuscator ./2minifiy/AMaxOffer_released0.min.js -o ./2minifiy/AMaxOffer_released1.min.js ^
  --target browser ^
  --seed 0^
  ^
  --disable-console-output true ^
  --self-defending true ^
  --debug-protection true ^
  --debug-protection-interval 4000 ^
  --domain-lock 'https://global.americanexpress.com/*' ^
  --string-array true ^
  --string-array-rotate true ^
  --string-array-shuffle true ^
  --string-array-threshold 0.7 ^
  --string-array-index-shift true ^
  --string-array-indexes-type hexadecimal-numeric-string ^
  ^
  --string-array-wrappers-count 5 ^
  --string-array-wrappers-type function ^
  --string-array-wrappers-parameters-max-count 5 ^
  --string-array-wrappers-chained-calls true ^
  --string-array-encoding rc4^
  --split-strings true ^
  ^
  --identifier-names-generator mangled ^
  ^
  --compact false ^
  --simplify true ^
  --transform-object-keys true ^
  --numbers-to-expressions true ^
  --control-flow-flattening true ^
  --control-flow-flattening-threshold 0.7 ^
  --dead-code-injection true ^
  --dead-code-injection-threshold 0.7 ^
  --disable-console-output true ^
  --rename-globals true ^


  --rename-properties true ^
  --rename-properties-mode safe
  --reserved-names 'GM.xmlHttpRequest' 
 
