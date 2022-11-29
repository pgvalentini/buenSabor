import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import LoadingBox from '../components/LoadingBox';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [nombreUsuario, setNombreUsuario] = useState(userInfo.nombreUsuario);
  const [emailUsuario, setEmailUsuario] = useState(userInfo.emailUsuario);
  const [passwordUsuario, setPasswordUsuario] = useState('');
  const [confirmPasswordUsuario, setConfirmPasswordUsuario] = useState('');
  const [address, setAddress] = useState(userInfo.address);
  const [location, setLocation] = useState(userInfo.location);
  const [phone, setPhone] = useState(userInfo.phone);

  const navigate = useNavigate();

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (passwordUsuario !== confirmPasswordUsuario) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axios.put(
        '/api/users/profile',
        {
          nombreUsuario,
          emailUsuario,
          passwordUsuario,
          address,
          location,
          phone,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Usuario actualizado correctamente');
      navigate(-1);
    } catch (err) {
      dispatch({
        type: 'UPDATE_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>Perfil de usuario </title>
      </Helmet>

      <h1 className="my-3">Perfil de usuario</h1>
      <form onSubmit={submitHandler}>
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
          <Button type="submit">Actualizar</Button>
          {loadingUpdate && <LoadingBox></LoadingBox>}{' '}
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
