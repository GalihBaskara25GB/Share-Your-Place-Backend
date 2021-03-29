const HttpError = require('../models/http-error')
const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')

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

const getUsers = (req, res, next) => {
    res.status(200).json({users: DUMMY_USERS})
}

const signup = (req, res, next) => {
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please fill correct inputs', 422)
    }
    

    const {name, email, password } = req.body
    const hasUser = DUMMY_USERS.find(u => u.email === email)
    
    if(hasUser) {
        throw new HttpError('Email already used, please use another email', 422)
    }

    const createdUser = {
        id: uuid(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(createdUser)
    
    res.status(201).json({user: createdUser})
}

const login = (req, res, next) => {
    const {email, password} = req.body
    const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Username or password not match', 401)
    }

    res.json({message: 'logged in'})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login