@echo off
cd C:\xampp\htdocs\git\Gamify-Passport
node main.js -port 2000 -online false -timeout 120000 -threads 1 -debug_mode true -db passport -mongo_remote false -monitor true
pause