const express = require('express');
const app = express();
const cors = require('cors');
const API_ROUTES = require('@routes/API.routes.js');

app.use(express.json());
app.use(cors())

app.use('/', API_ROUTES)

module.exports = app;