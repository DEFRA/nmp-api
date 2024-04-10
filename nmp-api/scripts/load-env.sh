#!/bin/bash

# Path to the .env file
ENV_FILE="../.env"

# Check if the .env file exists
if [ -f "$ENV_FILE" ]; then
    # Read each line in the .env file
    while IFS='=' read -r key value; do
        # Export the key-value pair as an environment variable
        export "$key"="$value"
    done <"$ENV_FILE"

    echo "Environment variables exported from .env file"
else
    echo "Error: .env file not found"
fi

chmod +x scripts/load-env.sh

env
