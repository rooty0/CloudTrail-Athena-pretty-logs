#!/usr/bin/env bash

sleep 1 && open "http://localhost:8000/cloudtrail.html" &
python3 -m http.server

