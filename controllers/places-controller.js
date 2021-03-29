const {v4: uuid} = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/places')

let DUMMY_PLACES= [
    {
        id:'p1',
        title: 'ITN 2 Malang',
        description: 'Kampus bertema Taman Safari',
        imageUrl: 'https://lh5.googleusercontent.com/p/AF1QipNiGCxCLKMd4PLBzT0tnVi3sLduC_eEYRsbOhd8=w408-h244-k-no',
        address: 'JL. Raya Karanglo KM. 2, Tasikmadu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65153',
        creator: 'u2',
        location: {
            lat: '-7.9166857',
            lng: '112.6342483'
        }
    },
    {
        id:'p2',
        title: 'ITN 1 Malang',
        description: 'Kampus bertema Gedung Angker',
        imageUrl: 'https://lh5.googleusercontent.com/p/AF1QipNiGCxCLKMd4PLBzT0tnVi3sLduC_eEYRsbOhd8=w408-h244-k-no',
        address: 'JL. Raya Karanglo KM. 2, Tasikmadu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65153',
        creator: 'u2',
        location: {
            lat: '-7.9166857',
            lng: '112.6342483'
        }
    },
]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(p => { return p.id === placeId })
    if(!place) throw new HttpError('Could not find Place with id: ' +placeId, 404)
    res.json({ place: place })
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(p => { return p.creator === userId })
    if(!places) return next(new Error('Could not find Place with user id: ' +userId, 404))
    res.json({places})
}

const createPlace = async (req, res, next) => {
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()) {
        next(new HttpError('Invalid inputs passed, please fill correct inputs', 422))
    }

    const { title, description, address, creator } = req.body
    let coordinates
    try {
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }

    const craetedPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator 
    }
    DUMMY_PLACES.push(craetedPlace)

    res.status(201).json({ place: craetedPlace })
}

const updatePlace = (req, res, next) => {
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please fill correct inputs', 422)
    }

    const { title, description } = req.body
    const placeId = req.params.pid
    
    const updatedPlace = {...DUMMY_PLACES.find(p => { p.id === placeId })}
    const placeIndex = DUMMY_PLACES.findIndex(p => { p.id === placeId })
    updatedPlace.title = title
    updatedPlace.description = description
    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid
    if(!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find place with the given ID!!', 404)
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)

    res.status(200).json({message: 'Data succesfully removed !'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace