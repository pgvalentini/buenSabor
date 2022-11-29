import mongoose from 'mongoose';

const unidadSchema = new mongoose.Schema(
  {
    nombreUnidad: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Unidad = mongoose.model('Unidad', unidadSchema);
export default Unidad;
