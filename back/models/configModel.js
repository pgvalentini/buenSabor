import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
  {
    cantidadCocineros: { type: Number, min: 1, required: true },
  },
  {
    timestamps: true,
  }
);

const Config = mongoose.model('Config', configSchema);
export default Config;
