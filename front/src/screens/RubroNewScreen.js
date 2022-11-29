import axios from 'axios';
import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import LoadingBox from '../components/LoadingBox';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import TextField from '@mui/material/TextField';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    default:
      return state;
  }
};

export default function RubroNewScreen() {
  const navigate = useNavigate();
  const [{ loadingUpload, loadingCreate }, dispatch] = useReducer(reducer, {});

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [nombreRubro, setNombreRubro] = useState('');
  const [altaRubro, setAltaRubro] = useState(true);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        `/api/rubros`,
        {
          nombreRubro,
          altaRubro,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Rubro creado!');
      /* navigate('/admin/rubros'); */
      navigate(-1);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Crear rubro de Productos</title>
      </Helmet>
      <h1>Crear rubro de Productos</h1>

      <Form onSubmit={submitHandler}>
        <TextField
          inputProps={{ maxLength: 40 }}
          className="mb-3"
          fullWidth
          required
          id="nombreRubro"
          label="Nombre"
          value={nombreRubro}
          onChange={(e) => {
            setNombreRubro(e.target.value);
          }}
        />

        <Form.Check
          className="mb-3"
          type="checkbox"
          id="altaRubro"
          label="Está dado de alta?"
          checked={altaRubro}
          onChange={(e) => setAltaRubro(e.target.checked)}
        ></Form.Check>

        <div className="mb-3">
          <Button disabled={loadingCreate || loadingUpload} type="submit">
            Crear rubro
          </Button>
          {loadingCreate && <LoadingBox></LoadingBox>}{' '}
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
