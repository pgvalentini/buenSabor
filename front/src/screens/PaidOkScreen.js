import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function PaidOkScreen() {
  const navigate = useNavigate();

  const { state } = useContext(Store);
  const { userInfo } = state;

  const valores = window.location.search;
  const urlParams = new URLSearchParams(valores);

  const payment_id = urlParams.get('payment_id');
  const external_reference = urlParams.get('external_reference');

  actPedido();

  async function actPedido() {
    try {
      await axios.put(
        `/api/orders/${external_reference}/pay`,
        {
          payment_id,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      ); 
      //Usar navigate, NO window.location.href, si no se pierde el localStorage
      navigate(`/order/${external_reference}`);
    } catch (err) {
      toast.error(getError(err));
    }
  }

  //window.location.href = `/order/${external_reference}`;
}
