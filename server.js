const express = require('express')
const mongoose = require('mongoose')
const next = require('next')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const routes = require('./api/index.js')
const handle = app.getRequestHandler()

mongoose.connect(`mongodb://localhost:27017/gems`, err => {
	if (err) return console.log(err.stack)
	console.log('Connected to MongoDB.')
})

app
	.prepare()
	.then(() => {
		const server = express()

		server.use('/api/*', bodyParser.json())
		server.use('/', cookieParser())
		server.use('/api', routes)

		server.get('/gems', (req, res) => {
			if (!req.cookies.session)
				return app.render(req, res, '/', {
					err: 'You must be logged in to access this page.'
				})
			app.render(req, res, '/gems')
		})

		server.get('/', (req, res) => {
			if (req.cookies.session) return res.redirect('/gems')
			handle(req, res)
		})

		server.get('*', (req, res) => {
			return handle(req, res)
		})

		server.listen(3000, err => {
			if (err) {
				throw err
			}
			console.log('> Ready on http://localhost:3000')
		})
	})
	.catch(err => {
		console.error(err.stack)
		process.exit(1)
	})
