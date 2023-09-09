const express = require('express')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person.js')

const app = express()

morgan.token('req-body', (req, res) => {
	if (req.method === 'POST') {
		return JSON.stringify(req.body)
	}
	return ''
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint'})
}

const errorHandler = (error, req, res, next) => {
	console.error(error.messgae)

	if (error.name === 'CastError')
		res.status(400).send({ error: 'malformatted id' })

	next(error)
}

app.use(express.static('dist'))

app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons =>
		res.json(persons)
	)
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id).then(person => {
		if (person)
			res.json(person)
		else
			res.status(404).end()
	})
	.catch(error => next(error))
})

app.get('/info', (req, res, next) => {
	Person.countDocuments({}).then(count => {
		res.send(`<p>Phonebook has info for ${count} people</p>
		<p>${new Date()}</p>`)
	})
	.catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
	const body = req.body

	if (!body.name && !body.number)
		return res.status(400).json({ error: 'name and number missing' })
	else if (!body.name)
		return res.status(400).json({ error: 'name missing' })
	else if (!body.number)
		return res.status(400).json({ error: 'number missing' })

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save().then(savedPerson => {
		res.json(savedPerson)
	})
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
	.then(updatedPerson => {
		res.json(updatedPerson)
	})
	.catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id).then(result => {
		res.status(204).end()
	})
	.catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})