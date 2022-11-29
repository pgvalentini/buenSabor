import express from 'express';
import { isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import Config from '../models/configModel.js';

const configRouter = express.Router();

configRouter.post(
  '/cocineros',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newCocineros = new Config({
      cantidadCocineros: req.body.cantidadCocineros,
    });
    const cocineros = newCocineros.save();
    res.send('ok');
  })
);

configRouter.get(
  '/cocineros',
  isAuth,
  //isAdmin,
  expressAsyncHandler(async (req, res) => {
    const data = await Config.findOne({}, {}, { sort: { createdAt: -1 } });
    res.send(data);
  })
);

export default configRouter;
