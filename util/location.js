const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyAjAZB0SVL0Gr-2z-ZvB7qUq2sqw54W6Fw';

const getCoordsForAddress = async (address) => {
    // return {
    //     lat: 99.9,
    //     lng: 99.9
    // }
    
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    )
    const data = response.data
    if(!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find the location, for the given address', 422)
        throw error
    }
    const coordinates = data.results[0].geometry.location
    
    return coordinates
}

module.exports = getCoordsForAddress