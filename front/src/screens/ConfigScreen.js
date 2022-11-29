import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        ingredientes: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function ConfigScreen() {
  const navigate = useNavigate();
  const [{ loading, error, ingredientes }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    cocineros: [],
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/ingredientes/`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/config/cocineros`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setCantidadCocineros(data.cantidadCocineros);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [userInfo]);

  const [cantidadCocineros, setCantidadCocineros] = useState(0);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `/api/config/cocineros`,
        {
          cantidadCocineros,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      toast.success('¡Cantidad de cocineros actualizada!');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  //Se muestran dos tablas diferentes
  //1. Ingredientes con stock actual por abajo del mínimo y dados de alta
  //2. Ingredientes con stock actual cerca del mínimo (distancia menor o igual al 20%) y dados de alta
  //Si alguna de las tablas no tiene ingredientes, no se muestra

  return (
    <div>
      <Helmet>
        <title>Configuración</title>
      </Helmet>
      <Row>
        <Col>
          <h1>Configuración</h1>
        </Col>
      </Row>
      <Row className="align-right p-3 mb-2 bg-warning text-dark text-align-center">
        <Form onSubmit={submitHandler}>
          <Row>
            <Col>¿Cuántos cocineros trabajan hoy?</Col>
            <Col>
              <Form.Group className="mb-3" controlId="cantidadCocineros">
                <Form.Control
                  className="small-input"
                  value={cantidadCocineros}
                  onChange={(e) => setCantidadCocineros(e.target.value)}
                  required
                  type="Number"
                ></Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <div className="mb-3 align-left">
                <Button type="submit">OK</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Row>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          {ingredientes.filter(
            (ing) =>
              ing.stockActualIngrediente < ing.stockMinimoIngrediente &&
              ing.altaIngrediente === true
          ).length > 0 && (
            <>
              <div>
                <h2 className="red extra-large-margin-up">
                  Ingredientes bajos de stock
                </h2>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio de Costo</th>
                    <th>Stock Mínimo</th>
                    <th>Stock Actual</th>
                    <th>Diferencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientes
                    .filter(
                      (ing) =>
                        ing.stockActualIngrediente <
                          ing.stockMinimoIngrediente &&
                        ing.altaIngrediente === true
                    )
                    .map((ingrediente) => (
                      <tr key={ingrediente._id}>
                        <td>{ingrediente._id}</td>
                        <td>{ingrediente.nombreIngrediente}</td>
                        <td>$ {ingrediente.precioCostoIngrediente}</td>
                        <td>
                          {Number.isInteger(ingrediente.stockMinimoIngrediente)
                            ? ingrediente.stockMinimoIngrediente
                            : ingrediente.stockMinimoIngrediente.toFixed(2)}
                        </td>
                        <td>
                          {Number.isInteger(ingrediente.stockActualIngrediente)
                            ? ingrediente.stockActualIngrediente
                            : ingrediente.stockActualIngrediente.toFixed(2)}
                        </td>
                        <td className="red">
                          {Number.isInteger(
                            ingrediente.stockActualIngrediente -
                              ingrediente.stockMinimoIngrediente
                          )
                            ? ingrediente.stockActualIngrediente -
                              ingrediente.stockMinimoIngrediente
                            : (
                                ingrediente.stockActualIngrediente -
                                ingrediente.stockMinimoIngrediente
                              ).toFixed(2)}
                        </td>

                        <td>
                          <Button
                            type="button"
                            variant="light"
                            onClick={() =>
                              navigate(`/admin/ingrediente/${ingrediente._id}`)
                            }
                          >
                            <i className="bi bi-pencil-fill"></i>
                            {/* Editar */}
                          </Button>
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}

          {ingredientes.filter(
            (ing) =>
              ing.stockActualIngrediente >= ing.stockMinimoIngrediente &&
              ing.stockActualIngrediente < ing.stockMinimoIngrediente * 1.2 &&
              ing.altaIngrediente === true
          ).length > 0 && (
            <>
              <div>
                <h2 className="navy medium-large-margin-up">
                  Ingredientes cerca de mínimo de stock
                </h2>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio de Costo</th>
                    <th>Stock Mínimo</th>
                    <th>Stock Actual</th>
                    <th>Diferencia</th>

                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientes
                    .filter(
                      (ing) =>
                        ing.stockActualIngrediente >=
                          ing.stockMinimoIngrediente &&
                        ing.stockActualIngrediente <
                          ing.stockMinimoIngrediente * 1.2 &&
                        ing.altaIngrediente === true
                    )
                    .map((ingrediente) => (
                      <tr key={ingrediente._id}>
                        <td>{ingrediente._id}</td>
                        <td>{ingrediente.nombreIngrediente}</td>
                        <td>$ {ingrediente.precioCostoIngrediente}</td>
                        <td>
                          {Number.isInteger(ingrediente.stockMinimoIngrediente)
                            ? ingrediente.stockMinimoIngrediente
                            : ingrediente.stockMinimoIngrediente.toFixed(2)}
                        </td>
                        <td>
                          {Number.isInteger(ingrediente.stockActualIngrediente)
                            ? ingrediente.stockActualIngrediente
                            : ingrediente.stockActualIngrediente.toFixed(2)}
                        </td>
                        <td className="red">
                          {Number.isInteger(
                            ingrediente.stockActualIngrediente -
                              ingrediente.stockMinimoIngrediente
                          )
                            ? ingrediente.stockActualIngrediente -
                              ingrediente.stockMinimoIngrediente
                            : (
                                ingrediente.stockActualIngrediente -
                                ingrediente.stockMinimoIngrediente
                              ).toFixed(2)}
                        </td>

                        <td>
                          <Button
                            type="button"
                            variant="light"
                            onClick={() =>
                              navigate(`/admin/ingrediente/${ingrediente._id}`)
                            }
                          >
                            <i className="bi bi-pencil-fill"></i>
                            {/* Editar */}
                          </Button>
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
