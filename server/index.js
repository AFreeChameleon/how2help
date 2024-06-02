require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { getDescriptions } = require('./openai');

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();

async function main() {
    app.use(express.json());
    app.get('/postal-code', async (req, res) => {
        const { lat, lon } = req.query;
        try {
            const addressRes = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.GMAPS_API}`
            );
            if (addressRes.status >= 300 && addressRes.data.status === 'OK') {
                return res.status(500).json({ message: 'An error occurred, please try again later.' });
            }
            return res.json(addressRes.data);
        } catch (err) {
            console.log('ERROR', err);
            return res.status(500).json({ message: 'An error occurred, please try again later.' });
        }
    });

    app.get('/charities', async (req, res) => {
        try {
            const { lat, lon } = req.query;
            if (!lat || !lon) {
                return res.status(400).send('Missing latitude/longitude.');
            }
            const googleRes = await axios.post(`https://places.googleapis.com/v1/places:searchText`, {
                textQuery: 'charity',
                pageSize: 10,
                locationBias: {
                    circle: {
                        center: {
                            latitude: lat,
                            longitude: lon
                        },
                        radius: 5000
                    },
                },
                rankPreference: 'DISTANCE'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': process.env.GMAPS_API,
                    'X-Goog-FieldMask': 'places.displayName,'+
                        'places.location,'+
                        'places.formattedAddress,'+
                        'places.websiteUri,'+
                        'places.regularOpeningHours,'+
                        'places.rating,'+
                        'places.googleMapsUri,'+
                        'places.businessStatus,'+
                        'places.photos,'+
                        'places.id'
                }
            });
            if (!googleRes.data.places || googleRes.data.places.length === 0) {
                return res.status(404).json({ message: 'Cannot find places near you.' });
            }
            const formattedPlaces = googleRes.data.places
                .filter(place => 
                    place.businessStatus === 'OPERATIONAL' &&
                    (place.websiteUri || place.nationalPhoneNumber)
                )
                .map((place) => ({
                    id: place.id,
                    name: place.displayName.text,
                    address: place.formattedAddress,
                    link: place.websiteUri,
                    mapsLink: place.googleMapsUri,
                    phoneNumber: place.nationalPhoneNumber,
                    photos: place.photos,
                    rating: place.rating,
                    openNow: place.regularOpeningHours?.openNow,
                    openingHours: place.regularOpeningHours?.weekdayDescriptions,
                    distance: getDistanceFromLatLonInKm(
                        place.location.latitude,
                        place.location.longitude,
                        lat,
                        lon
                    ),
                    flags: {
                        noWebsite: !Boolean(place.websiteUri),
                        noPhotos: !place.photos?.length,
                        noPhoneNumber: !Boolean(place.nationalPhoneNumber),
                        noOpeningHours: !Boolean(place.regularOpeningHours?.weekdayDescriptions),
                        noRating: !Boolean(place.rating)
                    }
                }));
            const descriptions = await getDescriptions(formattedPlaces.map(p => p.name));
            const jsonDescriptions = JSON.parse(descriptions);
            for (let i = 0; i < jsonDescriptions.charities.length; i++) {
                formattedPlaces[i].description = jsonDescriptions.charities[i].description;
                formattedPlaces[i].category = jsonDescriptions.charities[i].category;
            }
            return res.json({
                charities: formattedPlaces.sort(compareByFlagCount)
            });
        } catch (err) {
            if (err.response) {
                console.log(err.response.data)
            } else {
                console.log('ERROR', err);
            }
            return res.status(500).json({ message: 'An error occurred, please try again later.' });
        }
    });

    app.get('/photo', async (req, res) => {
        const { path } = req.query;
        try {
            res.redirect(`https://places.googleapis.com/v1/${path}/media?maxHeightPx=700&key=${process.env.GMAPS_API}`);
        } catch (err) {
            res.status(500).send('');
        }
    });

    app.listen(PORT, () => console.log('server running'));
}

main();

function compareByFlagCount(a, b) {
    const aFlagCount = Number(a.flags.noWebsite) +
        Number(a.flags.noPhotos) +
        Number(a.flags.noPhoneNumber) +
        Number(a.flags.noOpeningHours) +
        Number(a.flags.noRating)
    const bFlagCount = Number(b.flags.noWebsite) +
        Number(b.flags.noPhotos) +
        Number(b.flags.noPhoneNumber) +
        Number(b.flags.noOpeningHours) +
        Number(b.flags.noRating)
    if (aFlagCount > bFlagCount) {
        return 1;
    } else if (aFlagCount < bFlagCount) {
        return -1;
    }
    return 0;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
