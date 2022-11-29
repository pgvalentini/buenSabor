import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      nombreUsuario: 'AdministradorPrueba',
      emailUsuario: 'administrador@gmail.com',
      passwordUsuario: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      nombreUsuario: 'Francisco',
      emailUsuario: 'francisco@gmail.com',
      passwordUsuario: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  unidades: [
    {
      nombreUnidad: 'gr',
    },
    {
      nombreUnidad: 'ml',
    },
    {
      nombreUnidad: 'cc',
    },
    {
      nombreUnidad: 'unidad',
    },
    {
      nombreUnidad: 'otra',
    },
    {
      nombreUnidad: 'kg',
    },
    {
      nombreUnidad: 'l',
    },
  ],
  cocineros: [
    {
      cantidadCocineros: 2,
    },
  ],
};

export default data;
