import express from 'express';
import data from '../data.js';
import User from '../models/userModel.js';
import Unidad from '../models/unidadModel.js';
import Config from '../models/configModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  //await User.deleteMany({});
  //const createdUsers = await User.insertMany(data.users);

  //await Unidad.deleteMany({});
  //const createdUnits = await Unidad.insertMany(data.unidades);

  //await Config.deleteMany({});
  //const createdCocineros = await Config.insertMany(data.cocineros);

  //res.send({ createdUnits, createdUsers, createdCocineros });
});

export default seedRouter;
