import mongoose from 'mongoose';

const rubroSchema = new mongoose.Schema(
  {
    nombreRubro: { type: String, required: true, unique: true },
    altaRubro: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const Rubro = mongoose.model('Rubro', rubroSchema);
export default Rubro;
