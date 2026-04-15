"""test if birdnet works properly"""

import birdnet
from dotenv import load_dotenv

load_dotenv()

audio_model = birdnet.load("acoustic", "2.4", "tf")


predictions = audio_model.predict(
    "example/Colaptes_auratus.ogg",
    # "example/soundscape.wav",
    # custom_species_list="example/species_list.txt",
)
print(predictions.to_structured_array())

print(predictions.to_dataframe().to_json(orient="records"))
