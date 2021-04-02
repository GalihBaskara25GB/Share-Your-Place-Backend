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
        output: 'json'
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
    
    const coordinates = {
        lat: data.data[1].latitude,
        lng: data.data[1].longitude
    }
    
    return coordinates
}

module.exports = getCoordsForAddress