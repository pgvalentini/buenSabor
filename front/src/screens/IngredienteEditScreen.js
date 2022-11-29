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
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

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
    case 'UPLOAD_REQUEST':
      return {
        ...state,
        loadingUpload: true,
        errorUpload: '',
      };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: action.payload,
      };
    default:
      return state;
  }
};

export default function IngredienteEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: ingredienteId } = params;
  const { state } = useContext(Store);
  const { userInfo } = state;

  //Si no está en el reducer no se puede usar abajo
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [nombreIngrediente, setNombreIngrediente] = useState('');
  const [stockMinimoIngrediente, setStockMinimoIngrediente] = useState();
  const [stockActualIngrediente, setStockActualIngrediente] = useState();
  const [unidadDeMedidaIngrediente, setUnidadDeMedidaIngrediente] =
    useState('');
  const [precioCostoIngrediente, setPrecioCostoIngrediente] = useState();
  const [altaIngrediente, setAltaIngrediente] = useState(true);
  const [rubroIngrediente, setRubroIngrediente] = useState('');
  const [rubros, setRubros] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/ingredientes/${ingredienteId}`);

        !localStorage.getItem('nombreIngredienteEdit') &&
          localStorage.setItem('nombreIngredienteEdit', data.nombreIngrediente);

        !localStorage.getItem('stockMinimoIngredienteEdit') &&
          localStorage.setItem(
            'stockMinimoIngredienteEdit',
            data.stockMinimoIngrediente
          );

        !localStorage.getItem('stockActualIngredienteEdit') &&
          localStorage.setItem(
            'stockActualIngredienteEdit',
            data.stockActualIngrediente
          );

        !localStorage.getItem('unidadDeMedidaIngredienteEdit') &&
          localStorage.setItem(
            'unidadDeMedidaIngredienteEdit',
            data.unidadDeMedidaIngrediente
          );

        !localStorage.getItem('rubroIngredienteEdit') &&
          localStorage.setItem('rubroIngredienteEdit', data.rubroIngrediente);

        !localStorage.getItem('precioCostoIngredienteEdit') &&
          localStorage.setItem(
            'precioCostoIngredienteEdit',
            data.precioCostoIngrediente
          );

        !localStorage.getItem('altaIngredienteEdit') &&
          localStorage.setItem('altaIngredienteEdit', data.altaIngrediente);

        localStorage.getItem('nombreIngredienteEdit') &&
          setNombreIngrediente(localStorage.getItem('nombreIngredienteEdit'));
        localStorage.getItem('stockMinimoIngredienteEdit') &&
          setStockMinimoIngrediente(
            localStorage.getItem('stockMinimoIngredienteEdit')
          );
        localStorage.getItem('stockActualIngredienteEdit') &&
          setStockActualIngrediente(
            localStorage.getItem('stockActualIngredienteEdit')
          );
        localStorage.getItem('unidadDeMedidaIngredienteEdit') &&
          setUnidadDeMedidaIngrediente(
            localStorage.getItem('unidadDeMedidaIngredienteEdit')
          );

        localStorage.getItem('precioCostoIngredienteEdit') &&
          setPrecioCostoIngrediente(
            localStorage.getItem('precioCostoIngredienteEdit')
          );
        localStorage.getItem('altaIngredienteEdit') &&
          setAltaIngrediente(
            localStorage.getItem('altaIngredienteEdit') === 'true'
              ? true
              : false
          );

        localStorage.getItem('rubroIngredienteEdit') &&
          setRubroIngrediente(localStorage.getItem('rubroIngredienteEdit'));

        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [ingredienteId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        Promise.all([getRubrosIngredientes(), getUnidadesIngredientes()]).then(
          function (results) {
            setRubros(results[0].data);
            setUnidades(results[1].data);
          }
        );
      } catch (err) {
        toast.error(getError(err));
      }
    };

    fetchData();
  }, []);

  function getRubrosIngredientes() {
    return axios.get(`/api/rubrosingredientes`);
  }

  function getUnidadesIngredientes() {
    return axios.get(`/api/unidades`);
  }

  function deleteLocalStorage() {
    let userInfo = localStorage.getItem('userInfo');
    localStorage.clear();
    localStorage.setItem('userInfo', userInfo);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/ingredientes/${ingredienteId}`,
        {
          _id: ingredienteId,
          nombreIngrediente,
          stockMinimoIngrediente,
          stockActualIngrediente,
          unidadDeMedidaIngrediente,
          precioCostoIngrediente,
          altaIngrediente,
          rubroIngrediente,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Ingrediente actualizado!');
      deleteLocalStorage();
      //navigate('/admin/ingredientes');
      navigate(-1);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
      deleteLocalStorage();
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Editar ingrediente {nombreIngrediente}</title>
      </Helmet>
      <h1>
        Editar ingrediente <br />
        <p style={{ color: 'blue' }}>{nombreIngrediente}</p>
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
            id="nombreIngrediente"
            label="Nombre"
            value={nombreIngrediente}
            onChange={(e) => {
              setNombreIngrediente(e.target.value);
              localStorage.setItem('nombreIngredienteEdit', e.target.value);
            }}
          />

          <TextField
            InputProps={{
              inputProps: {
                min: 0,
                step:
                  rubroIngrediente && rubroIngrediente ===
                  'Bebidas'
                    ? 1
                    : 0.01,
              },
            }}
            type="Number"
            className="medium-small-input mb-3"
            required
            id="stockMinimoIngrediente"
            label="Stock mínimo"
            value={
              Number.isInteger(Number(stockMinimoIngrediente))
                ? stockMinimoIngrediente
                : Number(stockMinimoIngrediente).toFixed(2)
            }
            onChange={(e) => {
              setStockMinimoIngrediente(e.target.value);
              localStorage.setItem(
                'stockMinimoIngredienteEdit',
                e.target.value
              );
            }}
          />
          <br />
          <TextField
            InputProps={{
              inputProps: {
                min: 0,
                step:
                  rubroIngrediente && rubroIngrediente ===
                  'Bebidas'
                    ? 1
                    : 0.01,
              },
            }}
            type="Number"
            className="medium-small-input mb-3"
            required
            id="stockActualIngredienteEdit"
            label="Stock actual"
            value={
              Number.isInteger(Number(stockActualIngrediente))
                ? stockActualIngrediente
                : Number(stockActualIngrediente).toFixed(2)
            }
            onChange={(e) => {
              setStockActualIngrediente(e.target.value);
              localStorage.setItem(
                'stockActualIngredienteEdit',
                e.target.value
              );
            }}
          />

          <Row>
            <Col>
              <TextField
                className="mb-3 medium-small-input"
                required
                id="unidadDeMedidaIngrediente"
                select
                label="Unidad de medida"
                value={unidadDeMedidaIngrediente}
                onChange={(e) => {
                  setUnidadDeMedidaIngrediente(e.target.value);
                  localStorage.setItem(
                    'unidadDeMedidaIngredienteEdit',
                    e.target.value
                  );
                }}
              >
                {unidades.map((unidad) => (
                  <MenuItem
                    key={unidad.nombreUnidad}
                    value={unidad.nombreUnidad}
                  >
                    {unidad.nombreUnidad}
                  </MenuItem>
                ))}
              </TextField>
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                className="medium-large-input mb-3"
                required
                id="rubroIngrediente"
                select
                label="Seleccionar rubro"
                value={rubroIngrediente}
                onChange={(e) => {
                  setRubroIngrediente(e.target.value);
                  localStorage.setItem('rubroIngredienteEdit', e.target.value);
                }}
              >
                {rubros.map((rubro) => (
                  <MenuItem key={rubro.nombreRubro} value={rubro.nombreRubro}>
                    {rubro.nombreRubro}
                  </MenuItem>
                ))}
              </TextField>
            </Col>
            <Col className="d-flex align-items-center mb-3">
              ¿No está el rubro? &rArr; &nbsp;
              <Button
                type="button"
                onClick={() => navigate(`/admin/rubroingrediente/new`)}
              >
                Crear rubro
              </Button>
            </Col>
          </Row>

          <TextField
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            required
            id="precioCostoIngrediente"
            label="Precio de costo"
            value={precioCostoIngrediente || ''}
            className="medium-input mb-3"
            type="Number"
            onChange={(e) => {
              setPrecioCostoIngrediente(e.target.value);
              localStorage.setItem(
                'precioCostoIngredienteEdit',
                e.target.value
              );
            }}
          />

          <Form.Check
            className="mb-3"
            type="checkbox"
            id="altaIngrediente"
            label="Está dado de alta?"
            checked={altaIngrediente}
            onChange={(e) => {
              setAltaIngrediente(e.target.checked);
              localStorage.setItem('altaIngredienteEdit', e.target.checked);
            }}
          ></Form.Check>

          <div className="mb-3">
            <Button disabled={loadingUpdate || loadingUpload} type="submit">
              Actualizar
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}{' '}
            <Button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                deleteLocalStorage();
                /* navigate(`/admin/ingredientes`); */
                navigate(-1);
              }}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
