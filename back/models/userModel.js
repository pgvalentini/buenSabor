import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nombreUsuario: { type: String, required: true },
    emailUsuario: { type: String, required: true, unique: true },
    passwordUsuario: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    address: { type: String },
    location: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
