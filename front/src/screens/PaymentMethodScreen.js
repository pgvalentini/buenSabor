import React, { useContext, useEffect, useState } from 'react';
import CheckoutSteps from '../components/CheckoutSteps';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod, shippingOption },
  } = state;

  const [paymentMethodName, setPaymentMethodName] = useState(
    paymentMethod || 'MercadoPago'
  );

  useEffect(() => {
    if (!shippingAddress.address && !shippingOption) {
      //Si no existe todavía una dirección y tampoco una opción de entrega, volver a shipping (anterior)
      navigate('/shipping');
    }

    //Si la opción de envío es domicilio, seteo directamente la forma de pago a MercadoPago
    //en Store y en localStorage
    if (shippingOption === 'domicilio') {
      setPaymentMethodName('MercadoPago');
      ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
      localStorage.setItem('paymentMethod', paymentMethodName);
    }
  }, [
    shippingAddress,
    navigate,
    shippingOption,
    paymentMethodName,
    ctxDispatch,
  ]); //Acordarse de siempre poner las variables que usamos en un useEffect

  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  const handleChange = (event) => {
    setPaymentMethodName(event.target.value);
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Método de pago</title>
        </Helmet>
        <h1 className="my-3">Método de pago</h1>
        <Form onSubmit={submitHandler}>
          <FormControl>
            <RadioGroup
              name="paymentMethod"
              value={paymentMethodName}
              onChange={handleChange}
            >
              <FormControlLabel
                value="MercadoPago"
                control={<Radio />}
                label="Mercado Pago"
              />
              {shippingOption === 'local' && (
                <FormControlLabel
                  value="Efectivo"
                  control={<Radio />}
                  label="Efectivo"
                />
              )}
            </RadioGroup>
          </FormControl>

          <div className="mb-3 large-margin-up">
            <Button type="submit">Continuar</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
