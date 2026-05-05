const express = require('express');
const router = express.Router();
const Catalog = require('../models/Catalog');

router.get('/', async (req, res) => {
  try {
    const catalogs = await Catalog.find();
    res.json(catalogs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  try {
    const newCatalog = new Catalog(req.body);
    const catalog = await newCatalog.save();
    res.json(catalog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
