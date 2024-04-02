#!/usr/bin/env bash

echo "Enter your api name (folder/api_name):"
read api_path
echo "Creating api on $api_path this location"

nest g service "$api_path"
nest g controller "$api_path"
nest g module "$api_path"

rm src/"$api_path"/*.spec.ts

echo "DONE!"
