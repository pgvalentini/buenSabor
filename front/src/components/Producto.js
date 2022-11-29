import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

function Producto(props) {
  const { producto } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  function stock(prod) {
    for (let ing = 0; ing < prod.ingredientes.length; ing++) {
      if (
        prod.ingredientes[ing].cantidad >
        prod.ingredientes[ing].ingrediente.stockActualIngrediente
      ) {
        return false;
      }
    }
    return true;
  }

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

  const addToCartHandler = async (item) => {
    //Comprobamos si ya existe en el carrito el item que queremos agregar
    const existItem = cart.cartItems.find((x) => x._id === producto._id);
    //si existe le agregamos 1 a la cantidad, si no la ponemos en 1
    const cantidad = existItem ? existItem.cantidad + 1 : 1;
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
  return (
    <div className="text-center">
      <Card
        style={{ width: '18rem', height: '24em' }}
        className=" border-radius"
      >
        <Link to={`/producto/${producto._id}`}>
          <img
            src={producto.imagenProducto}
            className="card-img-top producto-img3"
            alt={producto.nombreProducto}
          />
        </Link>
        <Card.Body>
          <Link to={`/producto/${producto._id}`}>
            <Card.Title>{producto.nombreProducto}</Card.Title>
          </Link>
          <Card.Text>${producto.precioVentaProducto}</Card.Text>
          <Card.Text>
            <Row>
              <Col>
                {producto.isCeliaco && (
                  <h6>
                    <Badge bg="success"> Apto celíacos </Badge>
                  </h6>
                )}
              </Col>
              <Col>
                {producto.isVegetariano && (
                  <h6>
                    <Badge bg="success"> Apto vegetarianos </Badge>
                  </h6>
                )}
              </Col>
            </Row>
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          {!stock(producto) ? (
            <Button variant="light" disabled>
              Sin stock
            </Button>
          ) : (
            <Button
              disabled={localStorage.getItem('localAbierto') === 'false'}
              onClick={() => addToCartHandler(producto)}
            >
              {localStorage.getItem('localAbierto') !== 'false' ? (
                <span class="bi bi-cart-fill">
                  &nbsp;&nbsp;Agregar al carrito
                </span>
              ) : (
                'Local cerrado'
              )}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}

export default Producto;
