import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import TextField from '@mui/material/TextField';
import GoogleLogin from 'react-google-login';
import { gapi } from 'gapi-script';

export default function SignupScreen() {
  const navigate = useNavigate();
  //useLocation es un hook de react, y usaremos la información del objeto 'search'...
  const { search } = useLocation();
  //Instanciamos URLSearchParams, le pasamos el objeto 'search' y obtenemos el redirect del cuerpo
  //Si viene del carrito de compras, entonces el valor será /shipping
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  //Comprobamos que exista y lo seteamos en la variable redirect, si no le seteamos '/'
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [passwordUsuario, setPasswordUsuario] = useState('');
  const [confirmPasswordUsuario, setConfirmPasswordUsuario] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  const clientId =
    '147686912643-ltnii4fb12jf91mhvgfdmk6qp520s3j8.apps.googleusercontent.com';

  //Guardamos el usuario en el store si el login es exitoso
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  //Creamos la función async submitHandler que recibe un evento como parámetro
  const submitHandler = async (e) => {
    e.preventDefault();
    if (passwordUsuario !== confirmPasswordUsuario) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      const { data } = await Axios.post('/api/users/signup', {
        nombreUsuario,
        emailUsuario,
        passwordUsuario,
        address,
        location,
        phone,
      });
      //Si el login es exitoso, 'despachamos' la acción USER_SIGNIN y le pasamos data
      //(actualizamos el store)
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      //Ahora guardamos la info del usuario (que está en el local Store) en el store del navegador
      //Ojo, 'userInfo' es lo que vuelve desde el store
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      //Ver en App.js lo relacionado con toastify
      //Traemos desde el back el error
      toast.error(getError(err));
    }
  };

  //Importante, ya que se actualizaron los métodos de Google
  useEffect(() => {
    gapi.load('client:auth2', () => {
      gapi.auth2.init({ clientId: clientId });
    });
  }, []);

  //Si el usuario no se registra en el formulario, sino con Google, se usará esta función
  const responseGoogle = async (response) => {
    try {
      const { data } = await Axios.post('/api/users/signupgoogle', {
        nombreUsuario: response.profileObj.name,
        emailUsuario: response.profileObj.email,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  //Usaremos useEffect para que si el usuario ya se logueó, si accede a la pantalla de SignIn, no le vuelva
  //a pedir el ingreso
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Registro de usuario</title>
      </Helmet>

      <h1 className="my-3">Registro de usuario</h1>
      <hr />
      <br />
      <div className="mb-3">
        <GoogleLogin
          clientId="147686912643-ltnii4fb12jf91mhvgfdmk6qp520s3j8.apps.googleusercontent.com"
          buttonText="Registrate con Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
      </div>
      <br />
      <hr />

      <b>O ingresá tus datos</b>
      <Form onSubmit={submitHandler}>
        <br />
        <TextField
          className="mb-3 large-input"
          required
          id="nombreUsuario"
          label="Nombre y apellido"
          value={nombreUsuario}
          onChange={(e) => {
            setNombreUsuario(e.target.value);
          }}
        />

        <br />

        <TextField
          className="mb-3 large-input"
          required
          type="email"
          id="emailUsuario"
          label="Email"
          value={emailUsuario}
          onChange={(e) => {
            setEmailUsuario(e.target.value);
          }}
        />
        <br />

        <TextField
          className="mb-3 medium-input"
          required
          type="password"
          id="passwordUsuario"
          label="Contraseña"
          value={passwordUsuario}
          autoComplete="new-password"
          onChange={(e) => {
            setPasswordUsuario(e.target.value);
          }}
        />
        <br />

        <TextField
          className="mb-3 medium-input"
          required
          type="password"
          id="confirmPasswordUsuario"
          label="Confirmar contraseña"
          value={confirmPasswordUsuario}
          autoComplete="new-password"
          onChange={(e) => {
            setConfirmPasswordUsuario(e.target.value);
          }}
        />
        <br />
        <TextField
          className="mb-3 large-input"
          id="address"
          label="Calle y número"
          helperText="Por ej 'San Martín 813'"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
        <br />
        <TextField
          className="mb-3 medium-large-input"
          id="location"
          label="Departamento"
          helperText="Por ej 'Las Heras'"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
          }}
        />
        <br />

        <TextField
          className="mb-3 medium-large-input"
          id="phone"
          label="Teléfono"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
        <div className="mb-3">
          <Button type="submit">Registrate</Button>
        </div>

        <hr />

        <div className="mb-3">
          ¿Ya tenés una cuenta?{' '}
          {/* Se dirigirá al usuario a la pantalla de Sign In y después a la dirección
          definida por la variable 'redirect' que dependerá de en dónde estemos. Esto se define
          con la lógica de arriba antes del return */}
          <Link to={`/signin?redirect=${redirect}`}>Ingresa</Link>
        </div>
      </Form>
    </Container>
  );
}
