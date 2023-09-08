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

app.use(express.static('dist'))

app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

let persons = [
	{ 
		"id": 1,
		"name": "Arto Hellas", 
		"number": "040-123456"
	},
	{ 
		"id": 2,
		"name": "Ada Lovelace", 
		"number": "39-44-5323523"
	},
	{ 
		"id": 3,
		"name": "Dan Abramov", 
		"number": "12-43-234345"
	},
	{ 
		"id": 4,
		"name": "Mary Poppendieck", 
		"number": "39-23-6423122"
	}
]

app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons =>
		res.json(persons)
	)
})

app.get('/api/persons/:id', (req, res) => {
	Person.findById(req.params.id).then(person => {
		res.json(person)
	})
})

app.get('/info', (req, res) => {
	res.send(`<p>Phonebook has info for ${persons.length} people</p>
	<p>${new Date()}</p>`)
})

app.post('/api/persons', (req, res) => {
	const body = req.body

	if (!body.name && !body.number)
		return res.status(400).json({ error: 'name and number missing' })
	else if (!body.name)
		return res.status(400).json({ error: 'name missing' })
	else if (!body.number)
		return res.status(400).json({ error: 'number missing' })
	// else if (persons.find(person => person.name === body.name))
	// 	return res.status(400).json({ error: 'name must be unique' })

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save().then(savedPerson => {
		res.json(savedPerson)
	})
})

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	persons = persons.filter(person => person.id !== id)

	res.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})