import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Producto from '../components/Producto';
import { LinkContainer } from 'react-router-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        productos: action.payload.productos,
        page: action.payload.page,
        pages: action.payload.pages,
        countProductos: action.payload.countProductos,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SearchScreen() {
  const navigate = useNavigate();
  //search tiene la query
  const { search } = useLocation();
  //seteo la query en sp
  const sp = new URLSearchParams(search); //Ej: search?category=hamburguesas
  const category = sp.get('category') || 'all'; //si no hay categoría, muestro todos los productos (viene de barra lateral)
  const query = sp.get('query') || 'all'; //(viene de cuadro de búsqueda)
  const page = sp.get('page') || 1; //para paginación

  const [{ loading, error, productos, pages, countProductos }, dispatch] = //Estas variables vienen del reducer
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/productos/search?page=${page}&query=${query}&category=${category}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [category, error, page, query]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/productos/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    return `/search?category=${filterCategory}&query=${filterQuery}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet>
        <title>Búsqueda de productos</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h3>Categoría</h3>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Todas
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Col>

        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div>
                    {countProductos === 0 ? 'No' : countProductos} Resultados
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {query !== 'all' || category !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
              </Row>
              {productos.length === 0 && (
                <MessageBox>Producto no encontrado</MessageBox>
              )}
              <Row>
                {productos.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Producto producto={product}></Producto>
                  </Col>
                ))}
              </Row>

              <div>
                {/* creamos un Array según la cantidad de pages
                (si tenemos 10 pages, habrá 10 ítems, y para cada ítem un LinkContainer
                */}
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
