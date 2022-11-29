import { useNavigate, useParams } from 'react-router-dom';
import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { getError, numeroALetras } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import ReactToPrint from 'react-to-print';
import Button from 'react-bootstrap/Button';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export default function FacturaScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();
  const componentRef = useRef();

  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchOrder();
  }, [navigate, order._id, orderId, userInfo]);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <>
      <Helmet>
        <title>Factura </title>
      </Helmet>
      <ReactToPrint
        trigger={() => (
          <div className="align-center">
            <Button className="mb-5">Imprimir / Descargar</Button>
          </div>
        )}
        content={() => componentRef.current}
      />
      <div className="container p-2" ref={componentRef}>
        <div className="div-factura-cuadro">
          <Row>
            <Col md={1}>
              <img
                className="img img-responsive"
                src="https://res.cloudinary.com/elbuensabor-mern/image/upload/v1668528860/Logo_de_pizza_Auth0_lhawqf.png"
                alt="El Buen Sabor"
                width="75"
                height="75"
              />
            </Col>

            <Col md={4} className="text-align-left">
              <h2>El Buen Sabor</h2>
            </Col>

            <Col md={2} className="text-align-center">
              <h1>B</h1>
              Cod. 006
            </Col>

            <Col md={5} className="text-align-center">
              <br />
              N° {order.numeroFactura} <br />
              FECHA:{' '}
              {order.paidAt.substring(8, 10) +
                '/' +
                order.paidAt.substring(5, 7) +
                '/' +
                order.paidAt.substring(0, 4)}{' '}
              <br />
            </Col>
          </Row>

          <br />
          <br />

          <Row>
            <Col md={6} className="text-align-left">
              EL BUEN SABOR SRL
              <br />
              Coronel Rodríguez 273 Ciudad Mendoza
              <br />
              Tel: (0261) 555-5555
              <br />
              Email: elbuensaboronesoftware@gmail.com
              <br />
              <br />
              IVA Responsable Inscripto
            </Col>

            <Col md={6} className="text-align-right">
              CUIT: 12-44888696-09 <br />
              Ing. Brutos: 123-987654-3 <br />
              Inicio de Act: 12/03/2020 <br />
              Establecimiento: 44-6655489-11 <br />
            </Col>
          </Row>
        </div>

        <hr />

        <div className="div-factura-cuadro">
          <Row>
            <Col md={12} className="text-align-center">
              <b> CLIENTE </b>
            </Col>
          </Row>

          <Row>
            {/* <Col md={12} className="text-align-left"> {order.shippingAddress}</Col> */}
            <Col md={12} className="text-align-left">
              Nombre:{' '}
              {order.shippingAddress
                ? order.shippingAddress.fullName
                : order.user.nombreUsuario}{' '}
              <br />
              Domicilio:{' '}
              {order.shippingAddress
                ? order.shippingAddress.address
                : ''} - {order.shippingAddress ? order.location : ''} <br />
              Teléfono:{' '}
              {order.shippingAddress ? order.shippingAddress.phone : ''} <br />
              Cond. IVA: Consumidor Final <br />
              Cond. de venta: {order.paymentMethod} <br />
            </Col>
          </Row>
        </div>

        <hr />

        <Row>
          <Col md={12}>
            <table className="table table-condensed table-bordered table-striped">
              <thead>
                <tr>
                  <th className="col-md-2 text-align-center">Cantidad</th>
                  <th className="col-md-6">Descripción</th>
                  <th className="col-md-2 text-align-center">
                    Precio unitario
                  </th>
                  <th className="col-md-2 text-align-center">Parcial</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems &&
                  order.orderItems.map((item) => (
                    <tr key={item.nombreProducto}>
                      <td className="text-align-center">{item.cantidad}</td>
                      <td>{item.nombreProducto}</td>
                      <td className="text-align-center">
                        {item.precioVentaProducto}
                      </td>
                      <td className="text-align-center">
                        {item.cantidad * item.precioVentaProducto}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Col>
        </Row>

        <div>
          <br />
          <br />

          <Row>
            <Col md={7} className="text-align-left">
              <br />
              <br />
              <br />
              SON{' '}
              {numeroALetras(
                order.taxPrice
                  ? (
                      order.itemsPrice +
                      order.discount +
                      order.taxPrice * 0.1
                    ).toFixed(2)
                  : order.totalPrice.toFixed(2)
              )}
            </Col>

            <Col md={2} className="text-align-right div-factura-bottom-left">
              <p>Subtotal </p>
              <p>Descuento </p>
              <p>Total </p>
            </Col>

            <Col md={2} className="text-align-left div-factura-bottom-right">
              <p>$ {order.itemsPrice.toFixed(2)} </p>

              {order.taxPrice ? (
                <p>$ {(order.discount + order.taxPrice * 0.1).toFixed(2)} </p>
              ) : (
                <p>$ {order.discount.toFixed(2)} </p>
              )}

              {order.taxPrice ? (
                <p>
                  ${' '}
                  {(
                    order.itemsPrice +
                    order.discount +
                    order.taxPrice * 0.1
                  ).toFixed(2)}{' '}
                </p>
              ) : (
                <p>$ {order.totalPrice.toFixed(2)} </p>
              )}
            </Col>

            <div className="col-md-3"></div>
          </Row>
        </div>

        <br />
        <br />
        <br />
        <br />
        <Row className="row">
          <Col md={12} className="text-align-center">
            <p className="h5">Gracias por su compra</p>
          </Col>
        </Row>
      </div>
    </>
  );
}
