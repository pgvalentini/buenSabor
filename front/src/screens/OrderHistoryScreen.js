import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title> Historial de pedidos </title>
      </Helmet>

      <h1>Historial de pedidos</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Forma de pago</th>
              <th>Pagado?</th>
              <th>Entregado?</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>$ {order.totalPrice.toFixed(2)}</td>
                <td>{order.paymentMethod}</td>
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
                  {order.isDelivered ? (
                    order.deliveredAt.substring(8, 10) +
                    '/' +
                    order.deliveredAt.substring(5, 7) +
                    '/' +
                    order.deliveredAt.substring(0, 4)
                  ) : (
                    <p className="red">No</p>
                  )}
                </td>
                <td>
                  <Button
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Detalle
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
