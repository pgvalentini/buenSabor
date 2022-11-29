import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function ShipingAdressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  //Me traigo del estado el shippingAddress que está en el cart (si es que existe)
  //para usar la info en los hooks
  const {
    userInfo,
    cart: { shippingAddress, shippingOption },
  } = state;

  const [fullName, setFullName] = useState(
    shippingAddress.fullName || userInfo.nombreUsuario || ''
  );
  const [address, setAddress] = useState(
    shippingAddress.address || userInfo.address || ''
  );
  const [location, setLocation] = useState(
    shippingAddress.location || userInfo.location || ''
  );
  const [phone, setPhone] = useState(
    shippingAddress.phone || userInfo.phone || ''
  );
  const [entrega, setEntrega] = useState(shippingOption || 'local');

  //Si el usuario no está logueado, no podré ingresar a shippingAddress
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate, entrega]);

  //Se guarda la opción de entrega (local o domicilio) en Store
  //y en localStorage
  //Si la opción es domicilio, se guarda además en Store y en localStorage
  //la dirección de entrega
  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({ type: 'SAVE_SHIPPING_OPTION', payload: entrega });
    localStorage.setItem(
      'shippingOption',

      entrega
    );

    if (entrega !== 'local') {
      ctxDispatch({
        type: 'SAVE_SHIPPING_ADDRESS',
        payload: {
          fullName,
          address,
          location,
          phone,
        },
      });
      localStorage.setItem(
        'shippingAddress',
        JSON.stringify({
          fullName,
          address,
          location,
          phone,
        })
      );
    }

    navigate('/payment');
  };

  const handleChange = (event) => {
    setEntrega(event.target.value);
  };

  return (
    <div>
      <Helmet>
        <title>Opción de entrega</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>

      <div className="container small-container">
        <h1 className="my-3">Opción de entrega</h1>
        <Form onSubmit={submitHandler}>
          <FormControl>
            <RadioGroup
              name="shippingOption"
              value={entrega}
              onChange={handleChange}
            >
              <FormControlLabel
                value="local"
                control={<Radio />}
                label="Retiro en local (10% de descuento)"
              />
              <FormControlLabel
                value="domicilio"
                control={<Radio />}
                label="Envío a domicilio"
              />
            </RadioGroup>
          </FormControl>

          {entrega === 'domicilio' && (
            <>
              <Form.Group
                className="mb-3 medium-margin-up"
                controlId="fullName"
              >
                <Form.Label>Nombre y apellido</Form.Label>
                <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                ></Form.Control>
              </Form.Group>
              <Form.Group className="mb-3" controlId="adress">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></Form.Control>
              </Form.Group>
              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Localidad</Form.Label>
                <Form.Control
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                ></Form.Control>
              </Form.Group>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                ></Form.Control>
              </Form.Group>
            </>
          )}

          <div className="mb-3 large-margin-up">
            <Button variant="primary" type="submit">
              Continuar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
