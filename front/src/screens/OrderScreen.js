import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import RecetaItem from '../components/RecetaItem';
import Form from 'react-bootstrap/Form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Countdown from 'react-countdown';
import Swal from 'sweetalert2';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  //El id viene de los parámetros
  const params = useParams();
  //el id lo sacamos de los parámetros y lo renombramos como 'orderId'
  const { id: orderId } = params;

  const valores = window.location.search;
  const urlParams = new URLSearchParams(valores);

  const [paid, setPaid] = useState('');
  const [estado, setEstado] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);

  const navigate = useNavigate();

  const [{ loading, error, order, successDeliver, successPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: '',
      successPay: false,
    });

  const handleChange = (event) => {
    setEstado(event.target.value);
  };

  const verFacturaHandler = () => {
    window.open(`/order/factura/${order._id}`);
  };

  const pagoMercadoPagoHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/pago', {
        orderId,
        totalPrice,
      });
      //Extraigo la dirección de MP para pagar y redirecciono
      //Abre en la misma ventana
      window.location.href = data.message;
      //Abre en otra
      //window.open (data.message);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (urlParams.get('paid')) {
      setPaid(urlParams.get('paid'));
    }

    if (paid !== undefined) {
      if (paid === 'false' || paid === 'pending') {
        toast.error('Error en el pago');
        setPaid('');
      }
    }
    setTotalPrice(order.totalPrice);
  }, [order.totalPrice, paid, urlParams]);

  useEffect(() => {
    if (
      !order.isPaid &&
      order.paymentMethod === 'MercadoPago' &&
      !userInfo.isAdmin &&
      order.shippingOption === 'domicilio'
    ) {
      Swal.fire(
        'Al ser un envío a domicilio, el pedido no será procesado hasta no ser pagado por Mercado Pago'
      );
    }
  }, [
    order.isPaid,
    order.paymentMethod,
    order.shippingOption,
    userInfo.isAdmin,
  ]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setEstado(data.estadoPedido);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }

    if (
      !order._id ||
      successDeliver ||
      successPay ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    }
  }, [navigate, order._id, orderId, successDeliver, successPay, userInfo]);

  async function pagoHandler() {
    try {
      dispatch({ type: 'PAY_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/pay`,
        {},
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'PAY_SUCCESS', payload: data });
      toast.success('Pedido pagado!');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'PAY_FAIL' });
    }
  }

  const changeOrderStateHandler = async (e) => {
    try {
      await axios.put(
        `/api/orders/${order._id}/state`,
        { estado },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      navigate(0);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  // Random component
  const Completionist = () => <span>¡Ya está listo tu pedido!</span>;

  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <span>
          {hours < 10 && '0'}
          {hours}:{minutes < 10 && '0'}
          {minutes}:{seconds < 10 && '0'}
          {seconds}
        </span>
      );
    }
  };

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Pedido {orderId} </title>
      </Helmet>
      <h1 className="my-3">Pedido {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Opción de entrega</Card.Title>
              {order.shippingOption === 'local' ? (
                <Card.Text>
                  Retira en local <br />
                  <strong>Nombre: </strong> {order.user.nombreUsuario}{' '}
                </Card.Text>
              ) : (
                <Card.Text>
                  Entrega a domicilio <br />
                  <strong>Nombre: </strong> {order.shippingAddress.fullName}{' '}
                  <br />
                  <strong>Dirección: </strong> {order.shippingAddress.address},
                  {order.shippingAddress.location},{' '}
                  {order.shippingAddress.phone}
                </Card.Text>
              )}

              {order.isDelivered ? (
                <MessageBox variant="success">
                  Entregado{' '}
                  {
                    /* order.deliveredAt */
                    order.deliveredAt.substring(8, 10) +
                      '/' +
                      order.deliveredAt.substring(5, 7) +
                      '/' +
                      order.deliveredAt.substring(0, 4)
                  }
                </MessageBox>
              ) : (
                <MessageBox variant="danger">No entregado</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Pago</Card.Title>
              <Card.Text>
                <strong>Método: </strong>{' '}
                {order.paymentMethod === 'Efectivo'
                  ? order.paymentMethod
                  : order.paymentMethod + '  ID: ' + order.payment_id}{' '}
                <br />
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Pagado{' '}
                  {
                    /* order.paidAt */
                    order.paidAt.substring(8, 10) +
                      '/' +
                      order.paidAt.substring(5, 7) +
                      '/' +
                      order.paidAt.substring(0, 4)
                  }
                </MessageBox>
              ) : (
                <MessageBox variant="danger">No pagado</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Productos</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.imagenProducto}
                          alt={item.nombreProducto}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/producto/${item._id}`}>
                          {item.nombreProducto}
                        </Link>
                      </Col>
                      <Col md={2}>
                        <span>{item.cantidad}</span>
                      </Col>

                      {userInfo.isAdmin ? (
                        <>
                          {item.producto.recetaProducto && (
                            <Col md={4}>
                              <RecetaItem
                                nombreProducto={item.nombreProducto}
                                recetaProducto={item.recetaProducto}
                              />
                            </Col>
                          )}
                        </>
                      ) : (
                        <>
                          <Col md={2}>
                            <span>$ {item.precioVentaProducto}</span>
                          </Col>
                          <Col md={2}>
                            $ {item.cantidad * item.precioVentaProducto}
                          </Col>
                        </>
                      )}
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Resumen de pedido</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Subtotal</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Descuento</Col>
                    <Col>${order.discount.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>${order.totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Opciones</Card.Title>
              {!order.isPaid &&
                order.paymentMethod === 'MercadoPago' &&
                !userInfo.isAdmin && (
                  <ListGroup.Item>
                    <Button onClick={pagoMercadoPagoHandler}>
                      Pagar con Mercado Pago
                    </Button>
                  </ListGroup.Item>
                )}

              {!order.isPaid &&
                order.paymentMethod !== 'MercadoPago' &&
                userInfo.isAdmin && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={pagoHandler}>Marcar como pagado</Button>
                    </div>
                  </ListGroup.Item>
                )}
              {/* Comenté esta opción porque ahora la entrega del pedido se manejará con 
                  el combobox de estados de abajo */}
              {/* {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  {loadingDeliver && <LoadingBox></LoadingBox>}
                  <div className="d-grid">
                    <Button type="button" onClick={deliverOrderHandler}>
                      Entregar pedido
                    </Button>
                  </div>
                </ListGroup.Item>
              )} */}
            </Card.Body>
          </Card>

          {userInfo.isAdmin ? (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Estado del pedido</Card.Title>
                <Form onSubmit={changeOrderStateHandler}>
                  <TextField
                    className="medium-large-input mb-3"
                    required
                    id="estadoPedido"
                    select
                    defaultValue={order.estadoPedido}
                    onChange={handleChange}
                  >
                    <MenuItem disabled value={'A confirmar'}>
                      A confirmar
                    </MenuItem>

                    <MenuItem
                      disabled={
                        order.estadoPedido !== 'A confirmar' ||
                        (!order.isPaid &&
                          (order.shippingOption === 'domicilio' ||
                            order.paymentMethod === 'MercadoPago'))
                      }
                      value={'En cocina'}
                    >
                      En cocina
                    </MenuItem>

                    <MenuItem
                      disabled={
                        (order.estadoPedido !== 'A confirmar' &&
                          order.estadoPedido !== 'En cocina') ||
                        (!order.isPaid &&
                          (order.shippingOption === 'domicilio' ||
                            order.paymentMethod === 'MercadoPago'))
                      }
                      value={'Listo'}
                    >
                      Listo
                    </MenuItem>

                    <MenuItem
                      disabled={
                        order.estadoPedido !== 'Listo' ||
                        order.shippingOption === 'local' ||
                        (!order.isPaid &&
                          (order.shippingOption === 'domicilio' ||
                            order.paymentMethod === 'MercadoPago'))
                      }
                      value={'En delivery'}
                    >
                      En delivery
                    </MenuItem>

                    <MenuItem
                      disabled={
                        !order.isPaid ||
                        order.estadoPedido === 'Entregado' ||
                        (order.estadoPedido !== 'Listo' &&
                          order.estadoPedido !== 'En delivery') ||
                        (order.estadoPedido === 'Listo' &&
                          order.shippingOption === 'domicilio')
                      }
                      value={'Entregado'}
                    >
                      Entregado
                    </MenuItem>
                  </TextField>

                  {order.estadoPedido !== 'Entregado' && (
                    <Button type="submit">OK</Button>
                  )}
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Estado del pedido</Card.Title>
                {order.estadoPedido}
              </Card.Body>
            </Card>
          )}

          {userInfo.isAdmin && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Aclaraciones</Card.Title>
                {order.shippingOption === 'domicilio' &&
                  !order.isPaid &&
                  'El pedido ha sido pedido a domicilio pero no ha sido pagado, por lo que no se podrá cambiar de estado momentáneamente.\n'}

                {order.shippingOption === 'local' &&
                  !order.isPaid &&
                  order.paymentMethod !== 'Efectivo' &&
                  'El pedido será retirado en el local pero el cliente ha decidido pagar por Mercado Pago y todavía no está pagado, por lo que no se podrá cambiar de estado momentáneamente.\n'}

                {order.estadoPedido === 'Listo' &&
                  !order.isPaid &&
                  order.shippingOption === 'local' &&
                  order.paymentMethod === 'Efectivo' &&
                  'El pedido está listo pero no se puede entregar ya que todavía no está pagado.\n'}

                {order.estadoPedido === 'Entregado' &&
                  'El pedido ya está entregado, por lo que no se podrá cambiar el estado.\n'}
              </Card.Body>
            </Card>
          )}

          {order.isPaid && (
            <Card className="mb-3 align-center">
              <Card.Body>
                <Button onClick={verFacturaHandler}>Ver factura</Button>
              </Card.Body>
            </Card>
          )}

          {order.horaEstimada && (
            <Card className="mb-3 align-center">
              <Card.Body>
                <Card.Title>
                  Tiempo estimado restante para la entrega
                </Card.Title>
                {!order.isPaid && order.paymentMethod === 'MercadoPago' ? (
                  'Se ha elegido como opción de pago Mercado Pago, por lo que no se procesará el pedido hasta no ser pagado mediante la plataforma'
                ) : order.estadoPedido === 'Listo' &&
                  order.shippingOption === 'local' ? (
                  <Completionist />
                ) : (
                  <Countdown
                    date={Date.now() + Date.parse(order.horaEstimada)}
                    renderer={renderer}
                  />
                )}
                {/* {(order.isPaid && order.shippingOption === 'domicilio') ||
                (!order.isPaid && order.shippingOption === 'local') ? (
                  <Countdown
                    date={Date.now() + Date.parse(order.horaEstimada)}
                    renderer={renderer}
                  />
                ) : order.estadoPedido === 'Listo' &&
                  order.shippingOption === 'local' ? (
                  <Completionist />
                ) : (
                  'La orden ha sido pedida a domicilio pero todavía no ha sido pagada, por lo que todavía no es procesada.'
                )} */}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
