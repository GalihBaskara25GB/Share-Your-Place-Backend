const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose')

const collectionName = 'ShareMyPlace'
const user = {
  user_1: {
    username: 'galih',
    password: 'galihmongo'
  },
  user_2: {
    username: 'galih2',
    password: 'lerZlWOlNsquhZIv'
  }
}
const mongoUrl = 'mongodb://'+user.user_2.username+':'+user.user_2.password+'@cluster0-shard-00-00.gezou.mongodb.net:27017,cluster0-shard-00-01.gezou.mongodb.net:27017,cluster0-shard-00-02.gezou.mongodb.net:27017/'+collectionName+'?ssl=true&replicaSet=atlas-qcardn-shard-0&authSource=admin&retryWrites=true&w=majority'

const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Page not Found :(', 404)
  throw error
})

app.use((error, req, res, next) => {
  if(req.file) fs.unlink(req.file.path, (err) => {
    console.log(err)
  })
  if(res.headerSent) return next(error)
  res.status(error.code || 500)
  res.json({message: error.message || 'An Error Has Occured :('})
})

mongoose
  .connect(mongoUrl)
  .then(() => {
    app.listen(5000)
  })
  .catch((err) => {
    console.log(err)
  })

