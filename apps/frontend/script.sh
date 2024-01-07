#!/bin/bash
echo "/** @type {import('next').NextConfig} */
const nextConfig = {

}

module.exports = {nextConfig, env:{
    API_URL : '$API_URL'
}}
" > next.config.js

npm run build

sleep 10

npm run start