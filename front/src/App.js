import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import NavBar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import PaidOkScreen from './screens/PaidOkScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductNewScreen from './screens/ProductNewScreen';
import RubroListScreen from './screens/RubroListScreen';
import RubroNewScreen from './screens/RubroNewScreen';
import RubroEditScreen from './screens/RubroEditScreen';
import RubroIngredienteListScreen from './screens/RubroIngredienteListScreen';
import RubroIngredienteNewScreen from './screens/RubroIngredienteNewScreen';
import RubroIngredienteEditScreen from './screens/RubroIngredienteEditScreen';
import IngredienteListScreen from './screens/IngredienteListScreen';
import IngredienteEditScreen from './screens/IngredienteEditScreen';
import IngredienteNewScreen from './screens/IngredienteNewScreen';
import { DateTime } from 'luxon';
import Swal from 'sweetalert2';
import ConfigScreen from './screens/ConfigScreen';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import EggAltRoundedIcon from '@mui/icons-material/EggAltRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import NotFoundScreen from './screens/NotFoundScreen';
import FacturaScreen from './screens/FacturaScreen';

function App() {
  //Traemos el estado de la app desde el store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  //De la info traída del store, traemos el estado de cart y de userInfo
  const { cart, userInfo } = state;

  //Signout de un usuario. Limpiamos el Store y también el de navegador
  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.clear();
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
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
  }, []);

  useEffect(() => {
    isOpen();
    const interval = setInterval(() => {
      isOpen();
    }, 60000); //60000 es 1 minuto - 300000 son 5 minutos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.getItem('localAbierto') === 'false' && closeMessage();
  }, []);

  function closeMessage() {
    Swal.fire({
      title: '¡El local se encuentra cerrado!',
      html: '<br> Nuestro horario de atención es: <br> Todos los días de 20 a 00 <br> Sábados y Domingos de 11 a 15 <br><br> Igual podrás ver todos nuestros productos hasta que abramos',
      //icon: 'info',
      confirmButtonText: 'OK',
      imageUrl:
        'https://www.albawaba.com/sites/default/files/im/English_Slideshows_/SS_Ramadan_problems_/image02.gif',
      imageWidth: 300,
      imageHeight: 200,
    });
  }

  function isOpen() {
    let dt = DateTime;
    dt.toLocaleString(DateTime.DATE_SHORT);
    let diaSemanaActual = dt
      .now()
      .setZone('America/Argentina/Mendoza')
      .setLocale('es').weekdayLong;

    let horaActual = dt
      .now()
      .setZone('America/Argentina/Mendoza')
      .setLocale('es').hour; //-3
    //let horaActual = dt.now().setZone('America/Toronto').setLocale('es').hour; //-4
    //let horaActual = dt.now().setZone('Pacific/Gambier').setLocale('es').hour; //-9
    //let horaActual = dt.now().setZone('Europe/Madrid').setLocale('es').hour; //+1
    //VER TIME ZONES EN: https://momentjs.com/timezone/

    let minutoActual = dt
      .now()
      .setZone('America/Argentina/Mendoza')
      .setLocale('es').minute;

    let localAbierto =
      (horaActual >= 20 && horaActual <= 23 && minutoActual <= 59) ||
      ((diaSemanaActual === 'sábado' || diaSemanaActual === 'domingo') &&
        horaActual > 11 &&
        horaActual < 15);
  }

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? 'd-flex flex-column site-container active-cont'
            : 'd-flex flex-column site-container'
        }
      >
        <ToastContainer position="top-center" limit={1}></ToastContainer>
        <header>
          <NavBar bg="dark" variant="dark" expand="lg" fixed="top">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="bi bi-layout-sidebar-inset"></i>
              </Button>

              <LinkContainer to="/">
                <NavBar.Brand>El Buen Sabor</NavBar.Brand>
              </LinkContainer>
              <NavBar.Toggle aria-controls="basic-navbar-nav"></NavBar.Toggle>
              <NavBar.Collapse id="basic-navbar-nav">
                <SearchBox></SearchBox>
                <Nav className="me-auto w-100 justify-content-end">
                  {userInfo ? (
                    !userInfo.isAdmin && (
                      <Link to="/cart" className="nav-link">
                        <i className="bi bi-cart"> Carrito</i>
                        {cart.cartItems.length > 0 && (
                          <Badge pill bg="danger">
                            {cart.cartItems.reduce((a, c) => a + c.cantidad, 0)}
                          </Badge>
                        )}
                      </Link>
                    )
                  ) : (
                    <Link to="/cart" className="nav-link">
                      <i className="bi bi-cart"> Carrito</i>
                      {cart.cartItems.length > 0 && (
                        <Badge pill bg="danger">
                          {cart.cartItems.reduce((a, c) => a + c.cantidad, 0)}
                        </Badge>
                      )}
                    </Link>
                  )}

                  {userInfo ? (
                    <NavDropdown
                      title={
                        <i className="bi bi-person" width="50" height="50">
                          {' '}
                          {userInfo.nombreUsuario}
                        </i>
                      }
                      id="basic-nav-dropdown"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>
                          Perfil
                          <AccountBoxRoundedIcon className="align-right" />
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>
                          Historial de pedidos
                        </NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider></NavDropdown.Divider>
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Desconectarse{' '}
                        <ExitToAppRoundedIcon className="align-right" />
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In{' '}
                    </Link>
                  )}
                  {/* Ojo acá el condicional que verifica si isAdmin para mostrar la sección Admin */}

                  {userInfo && userInfo.isAdmin && (
                    <>
                      <Nav className="navbar">
                        <i className="vr invert-color large-margin-left"></i>
                      </Nav>

                      <NavDropdown
                        title="Administración"
                        id="admin-nav-dropdown"
                      >
                        <LinkContainer to="/admin/config">
                          <NavDropdown.Item>
                            Configuración
                            <i className="bi bi-gear-fill align-right"></i>
                          </NavDropdown.Item>
                        </LinkContainer>

                        <LinkContainer to="/admin/dashboard">
                          <NavDropdown.Item>
                            Estadísticas
                            <i className="bi bi-bar-chart-fill align-right"></i>
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/products">
                          <NavDropdown.Item>
                            Productos
                            <FastfoodRoundedIcon className="align-right" />
                          </NavDropdown.Item>
                        </LinkContainer>

                        <LinkContainer to="/admin/ingredientes">
                          <NavDropdown.Item>
                            Ingredientes
                            <EggAltRoundedIcon className="align-right" />
                          </NavDropdown.Item>
                        </LinkContainer>

                        <NavDropdown
                          drop="end"
                          id="nav-dropdown2"
                          title="Rubros"
                        >
                          <NavDropdown.Item href="/admin/rubros">
                            Productos
                          </NavDropdown.Item>
                          <NavDropdown.Item href="/admin/rubrosingredientes">
                            Ingredientes
                          </NavDropdown.Item>
                        </NavDropdown>

                        <LinkContainer to="/admin/orders">
                          <NavDropdown.Item>
                            Pedidos
                            <ReceiptRoundedIcon className="align-right" />
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/users">
                          <NavDropdown.Item>
                            Usuarios
                            <i className="bi bi-people-fill align-right"></i>
                          </NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    </>
                  )}
                </Nav>
              </NavBar.Collapse>
            </Container>
          </NavBar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categorías</strong>
            </Nav.Item>
            {categories &&
              categories.map((category) => (
                <Nav.Item key={category}>
                  <LinkContainer
                    to={`/search?category=${category}`}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    <Nav.Link>{category}</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              ))}
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/producto/:_id" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              {/* Usamos el componente ProtectedRoute para las rutas protegidas */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<HomeScreen />} />
              <Route path="*" element={<NotFoundScreen />} />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/factura/:id"
                element={
                  <ProtectedRoute>
                    <FacturaScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/paidok" element={<PaidOkScreen />} />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchScreen />} />

              {/* Admin routes */}

              <Route
                path="/admin/config"
                element={
                  <AdminRoute>
                    <ConfigScreen></ConfigScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen></DashboardScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen></ProductListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen></OrderListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen></UserListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/product/new"
                element={
                  <AdminRoute>
                    <ProductNewScreen></ProductNewScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen></ProductEditScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/ingredientes"
                element={
                  <AdminRoute>
                    <IngredienteListScreen></IngredienteListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/ingrediente/new"
                element={
                  <AdminRoute>
                    <IngredienteNewScreen></IngredienteNewScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/ingrediente/:id"
                element={
                  <AdminRoute>
                    <IngredienteEditScreen></IngredienteEditScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen></UserEditScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubros"
                element={
                  <AdminRoute>
                    <RubroListScreen></RubroListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubro/new"
                element={
                  <AdminRoute>
                    <RubroNewScreen></RubroNewScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubro/:id"
                element={
                  <AdminRoute>
                    <RubroEditScreen></RubroEditScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubrosingredientes"
                element={
                  <AdminRoute>
                    <RubroIngredienteListScreen></RubroIngredienteListScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubroingrediente/new"
                element={
                  <AdminRoute>
                    <RubroIngredienteNewScreen></RubroIngredienteNewScreen>
                  </AdminRoute>
                }
              ></Route>

              <Route
                path="/admin/rubroingrediente/:id"
                element={
                  <AdminRoute>
                    <RubroIngredienteEditScreen></RubroIngredienteEditScreen>
                  </AdminRoute>
                }
              ></Route>
            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center"> <i class="bi bi-c-circle"> </i>El Buen Sabor</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
