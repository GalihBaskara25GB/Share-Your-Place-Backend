const HttpError = require('../models/http-error')
const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')
const User = require('../models/users')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Galih A',
        email: 'galih@mail.com',
        password: 'test123'
    },
    {
        id: 'u2',
        name: 'Nikmatul A',
        email: 'fia@mail.com',
        password: 'test123'
    }
]

const getUsers = async (req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password')
    } catch (err) {
        return next(new HttpError('Something went wrong when try to fetch users, try again later :(', 500))
    }
    res.status(200).json({users: users.map(user => user.toObject({getters: true}))})
}

const signup = async (req, res, next) => {
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please fill correct inputs', 422)
    }
    

    const {name, email, password } = req.body
    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        return next(new HttpError('Something went wrong, try again later :(', 500))
    }
    
    if(existingUser) {
        return next(new HttpError('Email already used, please use another email', 422))
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://lh5.googleusercontent.com/p/AF1QipNiGCxCLKMd4PLBzT0tnVi3sLduC_eEYRsbOhd8=w408-h244-k-no',
        password,
        places: []
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Failed to sign up, please try again', 500)
        return next(error)
    }
    
    res.status(201).json({user: createdUser.toObject({getters: true})})
}

const login = async (req, res, next) => {
    const {email, password} = req.body
    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        return next(new HttpError('Something went wrong when trying to log in, try again later :(', 500))
    }
    
    if(!existingUser || existingUser.password !== password) {
        return next(new HttpError('Could not recognized email and password !', 422))
    }

    res.json({message: 'logged in'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login