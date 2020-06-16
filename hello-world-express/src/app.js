const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/v2', (req, res) => res.send('Hello World!!'))
app.get('/v3', (req, res) => res.send('Hello World!!!'))
app.get('/v4', (req, res) => res.send('Hello World!!!!'))

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
