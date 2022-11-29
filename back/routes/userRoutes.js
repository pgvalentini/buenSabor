import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken, isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  })
);
userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.nombreUsuario = req.body.nombreUsuario /*  || user.nombreUsuario */;
      user.emailUsuario = req.body.emailUsuario /*  || user.emailUsuario */;
      if (req.body.passwordUsuario) {
        user.passwordUsuario = bcrypt.hashSync(req.body.passwordUsuario, 8);
      }
      user.address = req.body.address;
      user.location = req.body.location;
      user.phone = req.body.phone;

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        nombreUsuario: updatedUser.nombreUsuario,
        emailUsuario: updatedUser.emailUsuario,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
        address: updatedUser.address,
        location: updatedUser.location,
        phone: updatedUser.phone,
      });
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.nombreUsuario = req.body.nombreUsuario /*  || user.nombreUsuario */;
      user.emailUsuario = req.body.emailUsuario /*  || user.emailUsuario */;
      user.isAdmin = Boolean(req.body.isAdmin);
      /* const updatedUser =  */ await user.save();
      res.send({ message: 'Usuario actualizado!' });
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.emailUsuario === 'admin@elbuensabor.com' || user.isAdmin) {
        res
          .status(400)
          .send({ message: 'No se puede eliminar a un administrador' });
        return;
      }
      await user.remove();
      res.send({ message: 'Usuario eliminado' });
    }
  })
);

//Con asyncHandler podemos manejar excepciones dentro de las rutas async de express
//sin tener que usar .then y catch. Las manejaremos en server.js
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ emailUsuario: req.body.emailUsuario });
    if (user) {
      if (bcrypt.compareSync(req.body.passwordUsuario, user.passwordUsuario)) {
        res.send({
          _id: user._id,
          nombreUsuario: user.nombreUsuario,
          emailUsuario: user.emailUsuario,
          isAdmin: user.isAdmin,
          token: generateToken(user),
          address: user.address,
          location: user.location,
          phone: user.phone,
        });
        return;
      }
    }
    res.status(401).send({ message: 'Email o password inválido' });
  })
);

userRouter.post(
  '/signingoogle',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ emailUsuario: req.body.emailUsuario });
    if (user) {
      res.send({
        _id: user._id,
        nombreUsuario: user.nombreUsuario,
        emailUsuario: user.emailUsuario,
        isAdmin: user.isAdmin,
        token: generateToken(user),
        address: user.address,
        location: user.location,
        phone: user.phone,
      });
      return;
    }
    res.status(401).send({
      message:
        'No hay un cliente registrado con la cuenta de Google que deseas ingresar, por favor registrate',
    });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    //Creamos un nuevo usuario
    const newUser = new User({
      nombreUsuario: req.body.nombreUsuario,
      emailUsuario: req.body.emailUsuario,
      passwordUsuario: bcrypt.hashSync(req.body.passwordUsuario),
      address: req.body.address,
      location: req.body.location,
      phone: req.body.phone,
    });
    //Se guarda el nuevo usuario en la DB
    const user = await newUser.save();
    res.send({
      _id: user._id,
      nombreUsuario: user.nombreUsuario,
      emailUsuario: user.emailUsuario,
      isAdmin: user.isAdmin,
      token: generateToken(user),
      address: user.address,
      location: user.location,
      phone: user.phone,
    });
  })
);

userRouter.post(
  '/signupgoogle',
  expressAsyncHandler(async (req, res) => {
    //Verificamos que el usuario no exista
    const userExist = await User.findOne({
      emailUsuario: req.body.emailUsuario,
    });
    if (!userExist) {
      //Creamos un nuevo usuario
      const newUser = new User({
        nombreUsuario: req.body.nombreUsuario,
        emailUsuario: req.body.emailUsuario,
      });

      //Se guarda el nuevo usuario en la DB
      const user = await newUser.save();
      res.send({
        _id: user._id,
        nombreUsuario: user.nombreUsuario,
        emailUsuario: user.emailUsuario,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } else {
      res.status(401).send({
        message: 'Ya hay registrado un usuario con el mail ingresado',
      });
    }
  })
);

export default userRouter;
