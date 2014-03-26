rm -rf err.log
rm -rf out.log
export NODE_ENV=development
forever start -a -o out.log -e err.log prodonus-app.js
