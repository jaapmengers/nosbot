#!/bin/bash

prime=$(redis-cli get prime)

if [ -z "$prime" ]
then
 prime="Deetman: geen stage dacht ik: bah wijkzorg, maar ik weer meer zomaar steeds te versnipperd"
fi

python /src/generate/sample.py --prime "$prime" --pick 2

redis-cli set prime "$(redis-cli srandmember generated)"
