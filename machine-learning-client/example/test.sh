file=Colaptes_auratus_XC104537_008.ogg

curl -X POST \
	-H "Content-Type: audio/ogg" \
	--data-binary "@${file}" \
	http://localhost:8000/analyze | python3 -m json.tool
