import { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const calcularCantidad = (item) => {
    let cantidad = 0;
    for (let i = 0; i < item.ingredientes.length; i++) {
      if (i === 0) {
        cantidad = Math.floor(
          item.ingredientes[i].ingrediente.stockActualIngrediente /
            item.ingredientes[i].cantidad
        );
      }
      if (
        Math.floor(
          item.ingredientes[i].ingrediente.stockActualIngrediente /
            item.ingredientes[i].cantidad
        ) < cantidad
      ) {
        cantidad = Math.floor(
          item.ingredientes[i].ingrediente.stockActualIngrediente /
            item.ingredientes[i].cantidad
        );
      }
    }
    return cantidad;
  };

  const updateCartHandler = async (item, cantidad) => {
    const { data } = await axios.get(`api/productos/${item._id}`);

    if (calcularCantidad(data) < cantidad) {
      toast.error('No hay más stock del producto');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, cantidad },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    //En signinScreen comprobamos que el usuario esté autenticado
    //si lo está, lo redirigimos a shipping
    navigate('/signin?redirect=/shipping');
  };

  return (
    <div>
      <Helmet>
        <title>Carrito de compras</title>
      </Helmet>
      <h1>Carrito de compras</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              El carrito está vacío. <Link to="/"> Ver productos </Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <img
                        src={item.imagenProducto}
                        alt={item.nombreProducto}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                    </Col>
                    <Col md={2}>
                      <Link to={`/producto/${item._id}`}>
                        {item.nombreProducto}
                      </Link>
                    </Col>
                    <Col md={2}>
                      <Button
                        onClick={() =>
                          updateCartHandler(item, item.cantidad - 1)
                        }
                        variant="light"
                        disabled={item.cantidad === 1}
                      >
                        <i className="bi bi-file-minus-fill"></i>
                      </Button>{' '}
                      <span>{item.cantidad}</span>{' '}
                      <Button
                        variant="light"
                        onClick={() =>
                          updateCartHandler(item, item.cantidad + 1)
                        }
                        disabled={item.cantidad === calcularCantidad(item)}
                      >
                        <i className="bi bi-file-plus-fill"></i>
                      </Button>
                    </Col>
                    <Col md={2}>$ {item.precioVentaProducto}</Col>
                    <Col md={2}>
                      $ {item.precioVentaProducto * item.cantidad}
                    </Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.cantidad, 0)}{' '}
                    productos) : $
                    {cartItems.reduce(
                      (a, c) => a + c.precioVentaProducto * c.cantidad,
                      0
                    )}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={checkoutHandler}
                      disabled={
                        cartItems.length === 0 ||
                        localStorage.getItem('localAbierto') === 'false'
                      }
                    >
                      {localStorage.getItem('localAbierto') !== 'false'
                        ? 'Ir al pago'
                        : 'No se puede pagar. Local cerrado'}
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
