#file=Colaptes_auratus_XC104537_008.ogg
file=northernflicker.webm

curl -X POST \
	-H "Content-Type: audio/webm" \
	--data-binary "@${file}" \
	http://localhost:8000/analyze | python3 -m json.tool
