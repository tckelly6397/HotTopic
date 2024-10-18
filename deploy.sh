#!/bin/bash

profile_name="tom"
bucket_name="tempai.tech"

# Check if the user has provided a bucket name
if [ "$#" -eq 1 ]; then
    profile_name=$1
elif [ "$#" -eq 2 ]; then
    profile_name=$1
    bucket_name=$2
elif [ "$#" -ne 0 ]; then
    echo "Usage: $0 [<profile_name>] [<bucket_name]"
    exit 1
fi

# Perform the sync operation using the provided bucket name
aws s3 sync ./src s3://${bucket_name}/src --profile=${profile_name}
