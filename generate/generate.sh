prime=$(redis-cli srandmember generated)

if [ -z "$prime" ]
then
 prime="Deetman: geen stage dacht ik: bah wijkzorg, maar ik weer meer zomaar steeds te versnipperd"
fi

python generate/sample.py --prime "$prime" --pick 2