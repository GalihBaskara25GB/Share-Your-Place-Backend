const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = '3b93be626ad53ec31c083e44092c034e';
const endPoint = ``

const getCoordsForAddress = async (address) => {
    // return {
    //     lat: 99.9,
    //     lng: 99.9
    // }
    const params = {
        access_key: API_KEY,
        query: address,
        output: 'json',
        limit: 1
    }
    const response = await axios.get(
        'http://api.positionstack.com/v1/forward',
        {params}
    )
    const data = response.data
    if(!data || data.message) {
        const error = new HttpError(data.message, 500)
        throw error
    }
    
    if(data.data[0] === undefined) {
        throw new HttpError('Could not find place, please give correct Address', 404)
    }
    
    const coordinates = {
        lat: data.data[0].latitude,
        lng: data.data[0].longitude
    }
    return coordinates
}

module.exports = getCoordsForAddress