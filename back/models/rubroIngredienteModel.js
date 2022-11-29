import mongoose from 'mongoose';

const rubroIngredienteSchema = new mongoose.Schema(
  {
    nombreRubro: { type: String, required: true, unique: true },
    altaRubro: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const RubroIngrediente = mongoose.model(
  'RubroIngrediente',
  rubroIngredienteSchema
);
export default RubroIngrediente;
