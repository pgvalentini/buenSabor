import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productoRouter from './routes/productoRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import pagoMercadoPagoRouter from './routes/pagoMercadoPagoRoutes.js';
import morgan from 'morgan';
import path from 'path';
import uploadRouter from './routes/uploadRoutes.js';
import rubroRouter from './routes/rubroRoutes.js';
import rubroIngredienteRouter from './routes/rubroIngredienteRoutes.js';
import ingredienteRouter from './routes/ingredienteRoutes.js';
import unidadRouter from './routes/unidadRoutes.js';
import configRouter from './routes/configRoutes.js';

//fetch con las variables
dotenv.config();

//Conectamos con Mongo
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' Conectado a MongoDB ');
  })
  .catch((err) => {
    console.log('Error al conectar con MongoDB: ' + err.message);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use('/api/seed', seedRouter);
app.use('/api/productos', productoRouter);
app.use('/api/ingredientes', ingredienteRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);
app.use('/pago', pagoMercadoPagoRouter);
app.use('/api/rubros', rubroRouter);
app.use('/api/rubrosingredientes', rubroIngredienteRouter);
app.use('/api/unidades', unidadRouter);
app.use('/api/config', configRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/ElBuenSabor/front/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/ElBuenSabor/front/build/index.html'));
});

//Maneja las excepciones dentro de las async express routes (express-async-handler)
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
