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
import GoogleLogin from 'react-google-login';
import { gapi } from 'gapi-script';
import TextField from '@mui/material/TextField';

export default function SigninScreen() {
  const navigate = useNavigate();
  //useLocation es un hook de react, y usaremos la información del objeto 'search'...
  const { search } = useLocation();
  //Instanciamos URLSearchParams, le pasamos el objeto 'search' y obtenemos el redirect del cuerpo
  //Si viene del carrito de compras, entonces el valor será /shipping
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  //Comprobamos que exista y lo seteamos en la variable redirect, si no le seteamos '/'
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [emailUsuario, setEmailUsuario] = useState('');
  const [passwordUsuario, setPasswordUsuario] = useState('');

  const clientId =
    '147686912643-ltnii4fb12jf91mhvgfdmk6qp520s3j8.apps.googleusercontent.com';

  //Guardamos el usuario en el store si el login es exitoso

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  //Creamos la función async submitHandler que recibe un evento como parámetro
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post('/api/users/signin', {
        emailUsuario,
        passwordUsuario,
      });
      //Si el login es exitoso, 'despachamos' la acción USER_SIGNIN y le pasamos data
      //(actualizamos el store)
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      //Ahora guardamos la info del usuario (que está en el local Store) en el store del navegador
      //Ojo, 'userInfo' es lo que vuelve desde el store
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.isAdmin) {
        navigate('/admin/config');
      } else {
        navigate(redirect || '/');
      }
    } catch (err) {
      //Traemos desde el back el error
      toast.error(getError(err));
    }
  };

  const responseGoogle = async (response) => {
    try {
      const { data } = await Axios.post('/api/users/signingoogle', {
        emailUsuario: response.profileObj.email,
      });
      //Si el login es exitoso, 'despachamos' la acción USER_SIGNIN y le pasamos data
      //(actualizamos el store)
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      //Ahora guardamos la info del usuario (que está en el local Store) en el store del navegador
      //Ojo, 'userInfo' es lo que vuelve desde el store
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.isAdmin) {
        navigate('/admin/config');
      } else {
        navigate(redirect || '/');
      }
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
        <title>Acceso</title>
      </Helmet>

      <h1 className="my-3">Acceso</h1>
      <hr />
      <br />

      <div className="mb-3">
        <GoogleLogin
          clientId="147686912643-ltnii4fb12jf91mhvgfdmk6qp520s3j8.apps.googleusercontent.com"
          buttonText="Ingresá con Google"
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
          autoComplete="current-password"
          onChange={(e) => {
            setPasswordUsuario(e.target.value);
          }}
        />

        <br />
        <div className="mb-3">
          <Button type="submit">Ingresá</Button>
        </div>

        <hr />

        <div className="mb-3">
          ¿Nuevo usuario?{' '}
          {/* Se dirigirá al usuario a la pantalla de Sign Up y después a la dirección
          definida por la variable 'redirect' que dependerá de en dónde estemos. Esto se define
          con la lógica de arriba antes del return */}
          <Link to={`/signup?redirect=${redirect}`}>Crea tu cuenta</Link>
        </div>
      </Form>
    </Container>
  );
}
