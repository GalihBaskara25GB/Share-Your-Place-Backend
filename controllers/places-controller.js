// const {v4: uuid} = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/places')
const User = require('../models/users')
const mongoose = require('mongoose')

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

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid
    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Something went wrong :(', 500)
        return next(error)
    }
    if(!place) return next(new HttpError('Could not find Place with id: ' +placeId, 404))
        
    res.json({ place: place.toObject({getters: true}) })
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    let userWithPlaces
    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        const error = new HttpError('Error when fetching data, try again later :(', 500)
        return next(error)
    }
    if(!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new Error('Could not find Place with user id: ' +userId, 404))
    }
    res.json({
        places: userWithPlaces.places.map(
            place => place.toObject({getters: true})
        )
    })
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

    const createdPlace = new Place({
        title,
        description,
        location: coordinates,
        address,
        image: 'https://lh5.googleusercontent.com/p/AF1QipNiGCxCLKMd4PLBzT0tnVi3sLduC_eEYRsbOhd8=w408-h244-k-no',
        creator 
    })

    let user
    try {
        user = await User.findById(creator)        
    } catch (err) {
        return next(new HttpError('Failed to create place, please try again', 404))
    }

    if(!user) return next(new HttpError('Could not save place, creator not found', 500))

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdPlace.save({session: sess})
        user.places.push(createdPlace)
        await user.save({session: sess})
        sess.commitTransaction()
    } catch (err) {
        console.log(err)
        const error = new HttpError('Failed to create place, please try again', 500)
        return next(error)
    }

    res.status(201).json({ place: createdPlace.toObject({getters: true}) })
}

const updatePlace = async (req, res, next) => {
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please fill correct inputs', 422))
    }

    const { title, description } = req.body
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place :(', 500)
        return next(error)
    }
    
    if(!place) return next(new HttpError('Could not find place with the given Id', 404))

    place.title = title
    place.description = description

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError('Failed to update place, please try again', 500)
        return next(error)
    }
    res.status(200).json({place: place.toObject({getters: true})})
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid
    let place
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find place :(', 500)
        return next(error)
    }

    if(!place) return next(new HttpError('Could not find place with the given Id', 404))
    
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.remove({session: sess})
        place.creator.places.pull(place)
        await place.creator.save({session: sess})
        sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place :(', 500)
        return next(error)
    }

    res.status(200).json({message: 'Data succesfully removed !'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace