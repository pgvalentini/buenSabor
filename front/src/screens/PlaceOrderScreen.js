import React, { useContext, useEffect, useReducer } from 'react';
import CheckoutSteps from '../components/CheckoutSteps';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';

//reducer es independiente de los componentes, entonces lo definimos afuera
const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.cantidad * c.precioVentaProducto, 0)
  );

  cart.tiempoPreparacion = calcularTiempoPreparacion();

  cart.discount =
    cart.shippingOption === 'local'
      ? -round2(cart.itemsPrice * 0.1)
      : round2(0);

  cart.totalPrice = cart.itemsPrice + cart.discount;

  cart.totalCost = calcularCosto();

  cart.horaEstimada = calcularEntregaEstimada();

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          discount: cart.discount,
          totalPrice: cart.totalPrice,
          totalCost: cart.totalCost,
          shippingOption: cart.shippingOption,
          estadoPedido: 'A confirmar',
          tiempoPreparacion: cart.tiempoPreparacion,
          horaEstimada: await cart.horaEstimada,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      //Este dispatch va al store
      ctxDispatch({ type: 'CART_CLEAR' });
      //Y este otro va al reducer del principio
      dispatch({ type: 'CREATE_SUCCESS' });
      //Dejo el carrito libre para otra compra
      localStorage.removeItem('cartItems');
      localStorage.removeItem('shippingAddress');
      localStorage.removeItem('paymentMethod');
      localStorage.removeItem('shippingOption');
      discountIngredients();
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const discountIngredients = async () => {
    try {
      for (let i = 0; i < cart.cartItems.length; i++) {
        for (let j = 0; j < cart.cartItems[i].ingredientes.length; j++) {
          await axios.put(
            `/api/ingredientes/${cart.cartItems[i].ingredientes[j].ingrediente._id}/discount`,
            {
              //_id: cart.cartItems[i].ingredientes[j].ingrediente._id,
              cantidad:
                cart.cartItems[i].cantidad *
                cart.cartItems[i].ingredientes[j].cantidad,
            },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );
        }
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  /* useEffect(() => {
    
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]); */

  function calcularCosto() {
    let costo = 0;
    for (let i = 0; i < cart.cartItems.length; i++) {
      for (let j = 0; j < cart.cartItems[i].ingredientes.length; j++) {
        costo +=
          cart.cartItems[i].cantidad *
          cart.cartItems[i].ingredientes[j].cantidad *
          cart.cartItems[i].ingredientes[j].ingrediente.precioCostoIngrediente;
      }
    }

    return round2(costo);
  }

  function calcularTiempoPreparacion() {
    let tiempo = 0;
    for (let i = 0; i < cart.cartItems.length; i++) {
      tiempo +=
        cart.cartItems[i].cantidad * cart.cartItems[i].tiempoCocinaProducto;
    }

    return round2(tiempo);
  }

  async function calcularEntregaEstimada() {
    if ((calcularTiempoPreparacion()) === 0) {
      if (cart.shippingOption === 'domicilio') {
        return 10;
      }
      return 0;
    }

    const { data } = await axios.get(`/api/orders/tiempo`, {
      headers: { authorization: `Bearer ${userInfo.token}` },
    });

    let tiempoDemoraCocina = Date.now() + data.message * 60000;

    let cantidadCocineros = await getCantidadCocineros();

    let tiempoPreparacion = calcularTiempoPreparacion();

    let retorno = tiempoPreparacion + tiempoDemoraCocina / cantidadCocineros;

    if (cart.shippingOption === 'domicilio') {
      retorno += 10;
    }

    return Math.round(retorno);
  }

  async function getCantidadCocineros() {
    const { data } = await axios.get(`/api/config/cocineros`, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });

    return data.cantidadCocineros;
  }

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Resumen del pedido</title>
      </Helmet>
      <h1 className="my-3">Resumen del pedido</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Opción de entrega</Card.Title>

              {cart.shippingOption === 'local' ? (
                <strong>
                  Retira en local <br />
                  <br />
                </strong>
              ) : (
                <Card.Text>
                  <strong>Entrega a domicilio </strong> <br />
                  <br />
                  <strong>Nombre: </strong> {cart.shippingAddress.fullName}{' '}
                  <br />
                  <strong>Dirección: </strong> {cart.shippingAddress.address},
                  {cart.shippingAddress.location}
                  <br />
                  <strong>Teléfono: </strong>
                  {cart.shippingAddress.phone}
                </Card.Text>
              )}

              <Link to="/shipping">Editar</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Pago</Card.Title>
              <Card.Text>
                <strong>Forma de pago: </strong> {cart.paymentMethod} <br />
              </Card.Text>
              <Link to="/payment">Editar</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Productos</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
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
                      <Col md={1}>
                        <span>{item.cantidad}</span>
                      </Col>
                      <Col md={2}>$ {item.precioVentaProducto}</Col>
                      <Col md={2}>
                        $ {item.cantidad * item.precioVentaProducto}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Editar</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Resumen</Card.Title>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Subtotal</Col>
                    <Col>$ {cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Descuento</Col>
                    <Col>$ {cart.discount.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Total</strong>
                    </Col>
                    <Col>$ {cart.totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Confirmar Orden
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
