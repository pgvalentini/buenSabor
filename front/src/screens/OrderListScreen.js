import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [filter, setFilter] = useState('A confirmar');
  const [busqueda, setBusqueda] = useState('');

  const handleChange = (event) => {
    setFilter(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    Swal.fire({
      title: 'Está seguro de eliminar?',
      text: 'Esta acción no se podrá revertir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí!',
      cancelButtonText: 'No!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          dispatch({ type: 'DELETE_REQUEST' });
          await axios.delete(`/api/orders/${order._id}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          toast.success('Pedido eliminado');
          dispatch({ type: 'DELETE_SUCCESS' });
        } catch (err) {
          toast.error(getError(err));
          dispatch({ type: 'DELETE_FAIL' });
        }
      }
    });
  };

  return (
    <div>
      <Helmet>
        <title>Pedidos</title>
      </Helmet>
      <Row>
        <Col>
          <h1>Pedidos</h1>
          <br />
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <Box>
            <TextField
              className="medium-large-input mb-3"
              select
              id="Estado"
              value={filter}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value={'Todos'}>Todos</MenuItem>
              <MenuItem value={'A confirmar'}>A confirmar</MenuItem>
              <MenuItem value={'En cocina'}>En cocina</MenuItem>
              <MenuItem value={'Listo'}>Listos</MenuItem>
              <MenuItem value={'En delivery'}>En delivery</MenuItem>
              <MenuItem value={'Entregado'}>Entregados</MenuItem>
            </TextField>
          </Box>
        </Col>
        <Col>
          <Box
            component="form"
            className="medium-large-input mb-3"
            noValidate
            autoComplete="off"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          >
            <TextField id="busqueda" label="Búsqueda" variant="outlined" />
          </Box>
        </Col>
      </Row>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Pagado?</th>
              <th>Entrega</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter(
                (ord) =>
                  ord._id.toString().toLowerCase().includes(busqueda) ||
                  ord.user.nombreUsuario.toLowerCase().includes(busqueda)
              )
              .filter((ord) =>
                ord.estadoPedido.includes(filter === 'Todos' ? '' : filter)
              )
              .map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    {order.user
                      ? order.user.nombreUsuario
                      : 'Usuario eliminado'}
                  </td>
                  <td>
                    {order.createdAt.substring(8, 10)}/
                    {order.createdAt.substring(5, 7)}/
                    {order.createdAt.substring(0, 4)}{' '}
                  </td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(8, 10) +
                      '/' +
                      order.paidAt.substring(5, 7) +
                      '/' +
                      order.paidAt.substring(0, 4)
                    ) : (
                      <p className="red">No</p>
                    )}
                  </td>

                  <td>
                    {order.shippingOption === 'local'
                      ? 'Retira en local'
                      : 'Delivery'}
                  </td>

                  <td>{order.estadoPedido}</td>
                  <td>
                    <Button
                      type="Button"
                      variant="light"
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Detalle
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(order)}
                    >
                      <i className="bi bi-trash"></i>
                      {/* Eliminar */}
                    </Button>
                    {order.isPaid && (
                      <Button
                        onClick={() => navigate(`/order/factura/${order._id}`)}
                      >
                        Ver factura
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
