import mongoose from 'mongoose';

const ingredienteSchema = new mongoose.Schema(
  {
    nombreIngrediente: { type: String, required: true, unique: true },
    stockMinimoIngrediente: { type: Number, required: true, min: 0 },
    stockActualIngrediente: { type: Number, required: true, min: 0 },
    unidadDeMedidaIngrediente: { type: String, required: true },
    precioCostoIngrediente: { type: Number, required: true, min: 0 },
    altaIngrediente: { type: Boolean, required: true },
    rubroIngrediente: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Ingrediente = mongoose.model('Ingrediente', ingredienteSchema);
export default Ingrediente;
