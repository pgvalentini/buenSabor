import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Ingrediente from '../models/ingredienteModel.js';
import { isAdmin, isAuth } from '../utils.js';

const ingredienteRouter = express.Router();

ingredienteRouter.get('/', async (req, res) => {
  const ingredientes = await Ingrediente.find();
  res.send(ingredientes);
});

ingredienteRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newIngrediente = new Ingrediente({
      nombreIngrediente: req.body.nombreIngrediente,
      stockMinimoIngrediente: req.body.stockMinimoIngrediente,
      stockActualIngrediente: req.body.stockActualIngrediente,
      unidadDeMedidaIngrediente: req.body.unidadDeMedidaIngrediente,
      precioCostoIngrediente: req.body.precioCostoIngrediente,
      altaIngrediente: req.body.altaIngrediente,
      rubroIngrediente: req.body.rubroIngrediente,
    });
    await newIngrediente.save();
    res.send({ message: 'Ingrediente creado' });
  })
);

ingredienteRouter.put(
  '/:id/discount',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const ingrediente = await Ingrediente.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { stockActualIngrediente: -req.body.cantidad } },
      { new: true }
    );
    res.send({
      message:
        'Ingrediente ' +
        ingrediente.nombreIngrediente + ' descontado'
    });
    } catch (error) {
      res.status(500).send({ message: error });
    }
    
  })
);

ingredienteRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const ingredienteId = req.params.id;
    const ingrediente = await Ingrediente.findById(ingredienteId);
    if (ingrediente) {
      ingrediente.nombreIngrediente = req.body.nombreIngrediente;
      ingrediente.stockMinimoIngrediente = req.body.stockMinimoIngrediente;
      ingrediente.stockActualIngrediente = req.body.stockActualIngrediente;
      ingrediente.unidadDeMedidaIngrediente =
        req.body.unidadDeMedidaIngrediente;
      ingrediente.precioCostoIngrediente = req.body.precioCostoIngrediente;
      ingrediente.altaIngrediente = req.body.altaIngrediente;
      ingrediente.rubroIngrediente = req.body.rubroIngrediente;
      await ingrediente.save();
      res.send({ message: 'Ingrediente actualizado' });
    } else {
      res.status(404).send({ message: 'Ingrediente no encontrado' });
    }
  })
);

ingredienteRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const ingrediente = await Ingrediente.findById(req.params.id);
    if (ingrediente) {
      await ingrediente.remove();
      res.send({ message: 'Ingrediente eliminado' });
    } else {
      res.status(404).send({ message: 'Ingrediente no encontrado' });
    }
  })
);

//Ojo usamos expressAsyncHandler
ingredienteRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || 15; //Elegir cuántos productos mostrar por pantalla
    const ingredientes = await Ingrediente.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countIngredientes = await Ingrediente.countDocuments();
    res.send({
      ingredientes,
      countIngredientes,
      page,
      pages: Math.ceil(countIngredientes / pageSize),
    });
  })
);

ingredienteRouter.get('/:id', async (req, res) => {
  try {
    const ingrediente = await Ingrediente.findById(req.params.id);
    if (ingrediente) {
      res.send(ingrediente);
    } else {
      res.status(404).send({ message: 'Ingrediente no encontrado' });
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

export default ingredienteRouter;
