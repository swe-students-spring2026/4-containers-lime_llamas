#!/usr/bin/bash

pushd example

ffmpeg -i Colaptes_auratus_XC104537.ogg -f segment -segment_time 3 -c copy Colaptes_auratus_XC104537_%03d.ogg

for i in {001..008}; do
	file="Colaptes_auratus_XC104537_$i.ogg"

	echo file

	curl -X POST \
		-H "Content-Type: audio/ogg" \
		--data-binary "@${file}" \
		http://localhost:8000/analyze | python3 -m json.tool
done

popd
