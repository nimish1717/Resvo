const express = require('express');
const router = express.Router();

const { getAllHalls } = require('../controllers/halls.controller');

router.get('/', getAllHalls);

module.exports = router;
