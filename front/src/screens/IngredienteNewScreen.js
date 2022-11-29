import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import LoadingBox from '../components/LoadingBox';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
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

export default function IngredienteNewScreen() {
  const navigate = useNavigate();
  const [{ loadingUpload, loadingCreate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

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

    localStorage.getItem('nombreIngrediente') &&
      setNombreIngrediente(localStorage.getItem('nombreIngrediente'));
    localStorage.getItem('stockMinimoIngrediente') &&
      setStockMinimoIngrediente(localStorage.getItem('stockMinimoIngrediente'));
    localStorage.getItem('stockActualIngrediente') &&
      setStockActualIngrediente(localStorage.getItem('stockActualIngrediente'));
    localStorage.getItem('unidadDeMedidaIngrediente') &&
      setUnidadDeMedidaIngrediente(
        localStorage.getItem('unidadDeMedidaIngrediente')
      );
    localStorage.getItem('precioCostoIngrediente') &&
      setPrecioCostoIngrediente(localStorage.getItem('precioCostoIngrediente'));
    localStorage.getItem('altaIngrediente') &&
      setAltaIngrediente(
        localStorage.getItem('altaIngrediente') === 'true' ? true : false
      );
    localStorage.getItem('rubroIngrediente') &&
      setRubroIngrediente(localStorage.getItem('rubroIngrediente'));
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
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        `/api/ingredientes`,
        {
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
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Ingrediente creado!');
      deleteLocalStorage();
      navigate(-1);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CREATE_FAIL' });
      deleteLocalStorage();
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Crear ingrediente</title>
      </Helmet>
      <h1>Crear ingrediente </h1>

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
            localStorage.setItem('nombreIngrediente', e.target.value);
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
          value={stockMinimoIngrediente}
          onChange={(e) => {
            setStockMinimoIngrediente(e.target.value);
            localStorage.setItem('stockMinimoIngrediente', e.target.value);
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
          id="stockActualIngrediente"
          label="Stock actual"
          value={stockActualIngrediente}
          onChange={(e) => {
            setStockActualIngrediente(e.target.value);
            localStorage.setItem('stockActualIngrediente', e.target.value);
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
                  'unidadDeMedidaIngrediente',
                  e.target.value
                );
              }}
            >
              {unidades.map((unidad) => (
                <MenuItem key={unidad.nombreUnidad} value={unidad.nombreUnidad}>
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
                localStorage.setItem('rubroIngrediente', e.target.value);
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
            localStorage.setItem('precioCostoIngrediente', e.target.value);
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
            localStorage.setItem('altaIngrediente', e.target.checked);
          }}
        ></Form.Check>

        <div className="mb-3">
          <Button disabled={loadingCreate || loadingUpload} type="submit">
            Crear ingrediente
          </Button>
          {loadingCreate && <LoadingBox></LoadingBox>}{' '}
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              deleteLocalStorage();
              navigate(-1);
            }}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
