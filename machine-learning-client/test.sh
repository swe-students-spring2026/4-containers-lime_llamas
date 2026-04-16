#!/usr/bin/bash

pushd example

file="XC558716.mp3"

ffmpeg -i "${file}" \
    -c:a libopus -b:a 128k \
    -f segment -segment_time 3 -reset_timestamps 1 \
    "${file}_%03d.webm" \

for i in {001..005}; do
	seg="${file}_$i.webm"

	echo seg 

	curl -X POST \
		-H "Content-Type: audio/webm;codecs=opus" \
		--data-binary "@${seg}" \
		http://localhost:8000/analyze | python3 -m json.tool
done

popd
