import jwt from 'jsonwebtoken';

//recibimos un usuario y le asignamos un token
//JWT_SECRET es una variable como un 'password' del sistema para encriptar la información
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      nombreUsuario: user.nombreUsuario,
      emailUsuario: user.emailUsuario,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  );
};

//middleware function. Al momento de enviar una orden al back comprueba que el usuario
//esté logueado
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Token inválido' });
      } else {
        //si está todo bien, desencripta la información del usuario
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No hay token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Token de administrador inválido' });
  }
};
