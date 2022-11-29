import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import { getError } from '../utils';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';
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

export default function RubroIngredienteEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: rubroId } = params;
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [nombreRubro, setNombreRubro] = useState('');
  const [altaRubro, setAltaRubro] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/rubrosingredientes/${rubroId}`);
        setNombreRubro(data.nombreRubro);
        setAltaRubro(data.altaRubro);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [rubroId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/rubrosingredientes/${rubroId}`,
        {
          _id: rubroId,
          nombreRubro,
          altaRubro,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Rubro actualizado!');
      navigate(-1);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Editar rubro de Ingredientes{nombreRubro}</title>
      </Helmet>

      <h1>
        Editar rubro de Ingredientes <br />
        <p style={{ color: 'blue' }}>{nombreRubro}</p>
      </h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
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
