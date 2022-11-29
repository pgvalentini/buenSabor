import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import TextField from '@mui/material/TextField';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
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

export default function UserEditScreen() {
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: userId } = params;
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setNombreUsuario(data.nombreUsuario);
        setEmailUsuario(data.emailUsuario);
        setIsAdmin(data.isAdmin);
        setAddress(data.address);
        setLocation(data.location);
        setPhone(data.phone);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/users/${userId}`,
        {
          _id: userId,
          nombreUsuario,
          emailUsuario,
          isAdmin,
          address,
          location,
          phone,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      toast.success('Usuario actualizado');
      dispatch({ type: 'UPDATE_SUCCESS' });
      navigate(-1);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Editar usuario {nombreUsuario}</title>
      </Helmet>
      <h1>
        Editar usuario <br />
        <p style={{ color: 'blue' }}>{nombreUsuario}</p>
      </h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
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

          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          ></Form.Check>

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
            <Button disabled={loadingUpdate} type="submit">
              Actualizar
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}{' '}
            <Button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
