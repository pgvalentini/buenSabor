import express from 'express';
import Rubro from '../models/rubroModel.js';
import { isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const rubroRouter = express.Router();

rubroRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const rubros = await Rubro.find();
    res.send(rubros);
  })
);

rubroRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newRubro = new Rubro({
      nombreRubro: req.body.nombreRubro,
      altaRubro: req.body.altaRubro,
    });
    const rubro = await newRubro.save();
    res.send({ message: 'Rubro creado' });
  })
);

rubroRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const rubroId = req.params.id;
    const rubro = await Rubro.findById(rubroId);
    if (rubro) {
      rubro.nombreRubro = req.body.nombreRubro;
      rubro.altaRubro = req.body.altaRubro;
      await rubro.save();
      res.send({ message: 'Rubro actualizado!' });
    } else {
      res.status(404).send({ message: 'Rubro no encontrado' });
    }
  })
);

rubroRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const rubros = await Rubro.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countRubros = await Rubro.countDocuments();
    res.send({
      rubros,
      countRubros,
      page,
      pages: Math.ceil(countRubros / pageSize),
    });
  })
);

rubroRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const rubro = await Rubro.findById(req.params.id);
    if (rubro) {
      await rubro.remove();
      res.send({ message: 'Rubro eliminado' });
    }
  })
);

rubroRouter.get('/:id', async (req, res) => {
  try {
    const rubro = await Rubro.findById(req.params.id);
    if (rubro) {
      res.send(rubro);
    } else {
      res.status(404).send({ message: 'Rubro no encontrado' });
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

export default rubroRouter;
