import express from 'express';
import RubroIngrediente from '../models/rubroIngredienteModel.js';
import { isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const rubroIngredienteRouter = express.Router();

rubroIngredienteRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const rubros = await RubroIngrediente.find();
    res.send(rubros);
  })
);

rubroIngredienteRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newRubro = new RubroIngrediente({
      nombreRubro: req.body.nombreRubro,
      altaRubro: req.body.altaRubro,
    });
    const rubro = await newRubro.save();
    res.send({ message: 'Rubro creado' });
  })
);

rubroIngredienteRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const rubroId = req.params.id;
    const rubro = await RubroIngrediente.findById(rubroId);
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

rubroIngredienteRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const rubros = await RubroIngrediente.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countRubros = await RubroIngrediente.countDocuments();
    res.send({
      rubros,
      countRubros,
      page,
      pages: Math.ceil(countRubros / pageSize),
    });
  })
);

rubroIngredienteRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const rubro = await RubroIngrediente.findById(req.params.id);
    if (rubro) {
      await rubro.remove();
      res.send({ message: 'Rubro eliminado' });
    }
  })
);

rubroIngredienteRouter.get('/:id', async (req, res) => {
  try {
    const rubro = await RubroIngrediente.findById(req.params.id);
    if (rubro) {
      res.send(rubro);
    } else {
      res.status(404).send({ message: 'Rubro no encontrado' });
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

export default rubroIngredienteRouter;
