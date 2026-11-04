# Earth texture provenance

All three JPEGs are unmodified NASA downloads. Maps are equirectangular; day/night use the same geographic UV orientation. Clouds drift illustratively. No texture is current weather or a live satellite feed. Rights/credits: [third-party notices](../THIRD_PARTY_NOTICES.md).

| File | Product | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| `earth-day-nasa-200407-5400.jpg` | Blue Marble Next Generation, July 2004 surface composite | 5400×2700 | `f55226d46d27e05511f2118dc6aa24f5dbf9b6b2cddc87cc6e0e7dd067c00b11` |
| `earth-night-nasa-2016-3600.jpg` | Black Marble 2016 VIIRS grayscale night lights | 3600×1800 | `4d2158f59123dadf0696a1cf8909c45018a1de8d0daab40da04122a5aa7f27c6` |
| `earth-clouds-nasa-2048.jpg` | Historical MODIS Blue Marble cloud composite | 2048×1024 | `daddaad84d7a33bbbc86cdda3f591099f57cee8607b7bcf3b67eb7e4f7a1c793` |

## Day map

[Original JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/july/world.200407.3x5400x2700.jpg) · [collection](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/)

Credit: NASA Earth Observatory, Blue Marble: Next Generation; Reto Stöckli, NASA Goddard Space Flight Center. July 2004 monthly cloud-free land/ocean composite. GPU tiers can downsample this source; upscaling does not create new observational detail.

## Night map

[Original JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144897/BlackMarble_2016_01deg_gray.jpg) · [NASA maps](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/)

Credit: NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA Goddard Space Flight Center. Selected cloud-free nights in 2016. The warm display tint is illustrative, not measured spectral color. City lighting is gated to the night side and shaded by cloud coverage.

## Cloud map

[Original JPEG](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg) · [source record](https://visibleearth.nasa.gov/images/57747/blue-marble-clouds/77558l)

Credit: NASA Goddard Space Flight Center; Reto Stöckli (land surface, shallow water, clouds), Robert Simmon (enhancements). Terra MODIS composite: two days of visible-light data and a third day of thermal IR near the poles. Published February 11, 2002. Grayscale luminance supplies coverage, not JPEG alpha.

## Historical SDO/AIA observation frames

Four 512×512 false-color AIA 304 Å visualization frames are bundled under `observations/aia-304-20240510/`. Credit: NASA/SDO and the AIA science team; Helioviewer visualization. The complete manifest in [`data/observed-weather.json`](../data/observed-weather.json) preserves each observation/request time, source/image ID, metadata/header/render URL, quality field and SHA-256. Observation times are 10 May 2024 at 18:00:05, 18:30:05, 19:00:05 and 19:30:05 UTC. Sampling every 30 minutes does not imply continuous coverage or instrument cadence. Retained raw quality values are not interpreted as calibrated quality certification. These visualization images are not new MIT application artwork; preserve credits and source-specific usage terms.
