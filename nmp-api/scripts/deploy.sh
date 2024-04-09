#!/usr/bin/env bash

npm install --global yarn
yarn --version
yarn install

cd npm-api || exit
yarn install
