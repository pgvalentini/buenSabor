import { useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Producto from '../components/Producto';
import { Helmet } from 'react-helmet-async';
import Carousel from 'react-elastic-carousel';
import Item from '../components/Item';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

//reducer acepta dos parámetros, el primero es el estado actual y el segundo es la acción que cambia
//el estado y crea un nuevo estado
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, productos: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_CATEGORIES_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_CATEGORIES_SUCCESS':
      return { ...state, categorias: action.payload, loading: false };
    case 'FETCH_CATEGORIES_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, productos, categorias }, dispatch] = useReducer(
    logger(reducer),
    {
      productos: [],
      categorias: [],
      loading: true,
      error: '',
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/productos');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_CATEGORIES_REQUEST' });
      try {
        const result = await axios.get('/api/productos/categories');
        dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_CATEGORIES_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  const breakPoints = [
    { width: 1, itemsToShow: 1, pagination: false },
    { width: 550, itemsToShow: 2, pagination: false },
    { width: 768, itemsToShow: 4, pagination: false },
    { width: 1200, itemsToShow: 4, pagination: false },
  ];

  //Se le agrega un mensaje mientras carga y si hay un error lo muestra, si no muestra los productos.
  return (
    <div>
      <Helmet>
        <title>El Buen Sabor</title>
      </Helmet>

      {/* OPCIÓN 3 --> MOSTRAR DE FORMA AUTOMÁTICA Y POR SEPARADO LAS CATEGORÍAS QUE TIENEN AL MENOS UN PRODUCTO 
        (CADA VEZ QUE SE AGREGUE UN NUEVO RUBRO Y UN NUEVO PRODUCTO A ESE RUBRO, SE MOSTRARÁ AUTOMÁTICAMENTE*/}
      {loading ? (
        //<div>Cargando...</div>
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        categorias.map((cat) => (
          <div key={cat} className="productos">
            <h1><hr/>{cat}<hr/></h1>
            <Carousel breakPoints={breakPoints} itemPadding={[0, 0]}>
              {productos
                .filter(
                  (prod) =>
                    prod.rubroProducto === cat && prod.altaProducto === true
                )
                .map((producto) => (
                  <Item
                    key={producto._id}
                    sm={6}
                    md={4}
                    lg={3}
                    className="mb-3"
                  >
                    <Producto producto={producto}></Producto>
                  </Item>
                ))}
            </Carousel>
          </div>
        ))
      )}

      {/* OPCIÓN 1 --> HACER MANUALMENTE CADA RUBRO Y MOSTRAR LOS PRODUCTOS AGRUPADOS POR RUBRO */}
      {/*
      <div className="productos">
        <h1>Nuestras Hamburguesas</h1>
        <Carousel breakPoints={breakPoints} itemPadding={[0, 0]}>
          {productos
            .filter((prod) => prod.rubroProducto === 'Hamburguesas')
            .map((producto) => (
              <Item key={producto._id} sm={6} md={4} lg={3} className="mb-3">
                <Producto producto={producto}></Producto>
              </Item>
            ))}
        </Carousel>
      </div>
      
      <div className="productos">
        <h1>Nuestras Pizzas</h1>
        <Carousel breakPoints={breakPoints} itemPadding={[0, 0]}>
          {productos
            .filter((prod) => prod.rubroProducto === 'Pizzas')
            .map((producto) => (
              <Item key={producto._id} sm={6} md={4} lg={3} className="mb-3">
                <Producto producto={producto}></Producto>
              </Item>
            ))}
        </Carousel>
      </div> */}

      {/* OPCIÓN 2 --> MOSTRAR DIRECTAMENTE TODOS LOS PRODUCTOS SIN DIFERENCIARLOS POR CATEGORIA */}
      {/* <h1> ¡Nuestros Productos! </h1>
      <div className="productos">
        {loading ? (
          //<div>Cargando...</div>
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          //<div>{error}</div>
          <Row>
            {productos.map((producto) => (
              <Col key={producto._id} sm={6} md={4} lg={3} className="mb-3">
                <Producto producto={producto}></Producto>
              </Col>
            ))}
          </Row>
        )}
      </div> */}
    </div>
  );
}

export default HomeScreen;
