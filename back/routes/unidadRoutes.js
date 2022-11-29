import express from 'express';
import { isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import Unidad from '../models/unidadModel.js';

const unidadRouter = express.Router();

unidadRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const unidades = await Unidad.find();
    res.send(unidades);
  })
);

export default unidadRouter;
