import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Chart from 'react-google-charts';
import { Helmet } from 'react-helmet-async';
import DatePicker from 'react-datepicker';

//Usaremos un reducer para traer la dashboard data desde el backend
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, summary: action.payload, loading: false }; //le asignamos a summary la data del back
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }; //el error viene desde el back
    default:
      return state;
  }
};

export default function DashboardScreen() {
  //descontract variables of the state of this reducer
  //y el dispatch para disparar alguna de las opciones del reducer y actualizar su estado
  //pasamos como primer parámetro el reducer de arriba
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    //y como 2° parám un objeto c/loading en true xq lo primero será un ajax req en el loading de este componente
    //(en el useEffect)
    loading: true,
    error: '', //y el error vacío
  });

  //También necesitamos la userInfo
  const { state } = useContext(Store);
  const { userInfo } = state; //De acá sacamos el token para autenticar al usuario y mostrar la dashboard data
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    //traemos la info del back
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setStartDate(new Date(data.fechas[0]._id));
        setEndDate(new Date(data.fechas[data.fechas.length - 1]._id));
        //llamamos a la acción 'FETCH_SUCCESS' y le pasamos la data (que se asignará a la variable summary del reducer)
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  const getRanking = () => {
    let ranking = [];

    for (let i = 0; i < summary.allProducts.length; i++) {
      ranking.push({});
      ranking[i].nombreProducto = summary.allProducts[i].nombreProducto;
      ranking[i].cantidad = 0;
      ranking[i].rubroProducto = summary.allProducts[i].rubroProducto;
      for (let j = 0; j < summary.allOrders.length; j++) {
        for (let k = 0; k < summary.allOrders[j].orderItems.length; k++) {
          if (
            summary.allOrders[j].orderItems[k].nombreProducto ===
              ranking[i].nombreProducto &&
            Date.parse(summary.allOrders[j].createdAt) >=
              Date.parse(startDate) &&
            Date.parse(summary.allOrders[j].createdAt) <= Date.parse(endDate)
          ) {
            ranking[i].cantidad += summary.allOrders[j].orderItems[k].cantidad;
          }
        }
      }
    }

    ranking.sort(function (a, b) {
      if (a.cantidad < b.cantidad) {
        return 1;
      }
      if (a.cantidad > b.cantidad) {
        return -1;
      }
      return 0;
    });
    return ranking;
  };

  return (
    <div>
      <Helmet>
        <title>Tablero</title>
      </Helmet>
      <h1 className="align-center">Tablero</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row className="align-center medium-margin-up">
            <Col md={2}>
              <Card>
                <Card.Body>
                  {/* summary viene del back, extraemos el primer elemento de users y el numUsers de ese primer elemento */}
                  <Card.Text className="align-center">Usuarios</Card.Text>
                  <Card.Title className="align-center">
                    {/* Si existe summary.users y summary.users[0] mostrar la cantidad
                    si no mostrar 0 */}
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card>
                <Card.Body>
                  <Card.Text className="align-center">Pedidos</Card.Text>
                  <Card.Title className="align-center">
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card>
                <Card.Body>
                  <Card.Text className="align-center">
                    Total de ventas
                  </Card.Text>
                  <Card.Title className="align-center">
                    ${' '}
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card>
                <Card.Body>
                  <Card.Text className="align-center">
                    Total de costos
                  </Card.Text>
                  <Card.Title className="align-center">
                    ${' '}
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].totalCosts.toFixed(2)
                      : 0}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card>
                <Card.Body>
                  <Card.Text className="align-center">Ganancia</Card.Text>
                  <Card.Title className="align-center">
                    ${' '}
                    {summary.orders && summary.orders[0]
                      ? (
                          summary.orders[0].totalSales -
                          summary.orders[0].totalCosts
                        ).toFixed(2)
                      : 0}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="align-center medium-margin-up">
            {summary.paymentMethod && summary.paymentMethod[0]
              ? summary.paymentMethod.map((x) => (
                  <Col md={3} key={x._id}>
                    <Card>
                      <Card.Body>
                        <Card.Text className="align-center">
                          Pagado con {x._id}
                        </Card.Text>
                        <Card.Title className="align-center">
                          $ {x.total.toFixed(2)}
                        </Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              : 0}
          </Row>

          <br />

          <Row>
            <Col md={12}>
              <div className="my-3 div-cuadro">
                <h2 className="align-center m-3">Ventas, costos y ganancias por día</h2>
                {summary.dailyOrders.length === 0 ? (
                  <MessageBox>No hay ventas</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="AreaChart"
                    loader={<div>Cargando gráfico...</div>}
                    data={[
                      ['Fecha', 'Ventas', 'Costos', 'Ganancia'],
                      ...summary.dailyOrders.map((x) => [
                        x._id,
                        x.sales,
                        x.costs,
                        x.sales - x.costs,
                      ]),
                    ]}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <div className="my-3 div-cuadro">
                <h2 className="align-center m-3">Ventas, costos y ganancias por mes</h2>
                {summary.monthOrders.length === 0 ? (
                  <MessageBox>No hay ventas</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="AreaChart"
                    loader={<div>Cargando gráfico...</div>}
                    data={[
                      ['Fecha', 'Ventas', 'Costos', 'Ganancia'],
                      ...summary.monthOrders.map((x) => [
                        x._id,
                        x.sales,
                        x.costs,
                        x.sales - x.costs,
                      ]),
                    ]}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="my-3 div-cuadro">
                <h2 className="align-center m-3">Productos por rubro</h2>
                {summary.productCategories.length === 0 ? (
                  <MessageBox>No hay rubros</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="PieChart"
                    loader={<div>Cargando gráfico...</div>}
                    data={[
                      ['Rubros', 'Productos'],
                      ...summary.productCategories.map((x) => [x._id, x.count]),
                    ]}
                  ></Chart>
                )}
              </div>
            </Col>

            <Col md={6}>
              <div className="my-3 div-cuadro">
                <h2 className="align-center m-3">Forma de pago preferida</h2>
                {summary.paymentMethod.length === 0 ? (
                  <MessageBox>No hay ventas</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="PieChart"
                    loader={<div>Cargando gráfico...</div>}
                    data={[
                      ['Forma de pago', 'Total'],
                      ...summary.paymentMethod.map((x) => [x._id, x.total]),
                    ]}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>

          <div className="m-4">
            <Row>
              <Col md={12} className="align-center">
                <div className="align-center">
                  Desde:
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="align-center">
                <div className="align-center">
                  Hasta:
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                    }}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className="my-3 align-right div-cuadro">
                  <h2 className="align-center m-3">Productos más vendidos</h2>
                  {getRanking().length === 0 ? (
                    <MessageBox>No hay productos vendidos</MessageBox>
                  ) : (
                    <Chart
                      className="align-center"
                      loader={<div>Cargando gráfico...</div>}
                      chartType="Table"
                      width="100%"
                      height="400px"
                      options={{ pageSize: 10 }}
                      data={[
                        [' ', 'Producto', 'Total unidades'],
                        ...getRanking()
                          .filter((x) => x.cantidad > 0)
                          .filter(
                            (x) =>
                              x.rubroProducto !== 'Gaseosas' &&
                              x.rubroProducto !== 'Bebidas con alcohol' &&
                              x.rubroProducto !== 'Bebidas sin alcohol'
                          )
                          .map((x, index) => [
                            index + 1,
                            x.nombreProducto,
                            x.cantidad,
                          ]),
                      ]}
                    />
                  )}
                </div>
              </Col>
              <Col md={6}>
                <div className="my-3 align-left div-cuadro">
                  <h2 className="align-center m-3">Bebidas más vendidas</h2>
                  {getRanking().length === 0 ? (
                    <MessageBox>No hay bebidas vendidos</MessageBox>
                  ) : (
                    <Chart
                      className="align-center"
                      loader={<div>Cargando gráfico...</div>}
                      chartType="Table"
                      width="100%"
                      height="400px"
                      options={{ pageSize: 10 }}
                      data={[
                        [' ', 'Producto', 'Total unidades'],
                        ...getRanking()
                          .filter((x) => x.cantidad > 0)
                          .filter(
                            (x) =>
                              x.rubroProducto === 'Gaseosas' ||
                              x.rubroProducto === 'Bebidas con alcohol' ||
                              x.rubroProducto === 'Bebidas sin alcohol'
                          )
                          .map((x, index) => [
                            index + 1,
                            x.nombreProducto,
                            x.cantidad,
                          ]),
                      ]}
                    />
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
}
