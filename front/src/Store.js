import { createContext, useReducer } from 'react';

export const Store = createContext();

//Tenemos que definir reducer e initialState del useReducer para el StoreProvider
//Será un objeto. Su campo 'cart' tendrá otro object que su atributo será un array vacío de ítems
//Comprobamos en el local storage si hay un usuario
const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},

    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',

    shippingOption: localStorage.getItem('shippingOption')
      ? localStorage.getItem('shippingOption')
      : '',

    //cartItems tiene que venir del localStorage
    cartItems: localStorage.getItem('cartItems') //Si cartItems existe en el localStorage...
      ? JSON.parse(localStorage.getItem('cartItems')) //usamos parse para convertir el string en un jsObject
      : [], //si no lo seteamos como un array vacío
  },
};

//El reducer tiene que ser una función. Recibe un estado y una acción
function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      //Guardamos en una constante el ítem que vamos a agregar al carrito como nuevo ítem
      const newItem = action.payload;
      //Comprobamos si ya existe en el carrito el ítem o no
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem //Si existe el ítem en el carrito...
        ? state.cart.cartItems.map(
            (
              item //Actualizamos el ítem "nuevo" con el ítem que ya existía en el carrito
            ) => (item._id === existItem._id ? newItem : item)
          )
        : [...state.cart.cartItems, newItem]; //Si no le agregamos el nuevo ítem al carrito
      //Para que se conserven los productos en el carrito cuando actualizamos la página...
      //usando setItem de localStorage, que acepta dos parámetros, la key en el localStorage...
      //y los valores para guardar en la key. Usamos stringfy para convertir los cartItems a un string
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } }; //y actualizamos el carrito basado en la const 'cartItems'
    /* return {
        ...state, //the object keep all the previous values in the field
        cart: {
          ...state.cart, //but for the cart object all the previous values in the cart object in the state
          //and only update cart items. Se mantienen los items anteriores (...state.cart.cartItems)
          //y agregamos el nuevo item ('action.payload')
          cartItems: [...state.cart.cartItems, action.payload],
        },
      }; */
    //Ojo, usamos llaves para que cartItems de abajo no se mezcle con la de arriba
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_CLEAR':
      //Mantenemos el estado del context, también del cart, pero cambiamos el estado de los cartItems a un array vacío
      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems: [],
          paymentMethod: '',
          shippingOption: '',
        },
      };
    case 'USER_SIGNIN': {
      //Mantenemos el estado anterior y actualizamos la info del usuario con la info
      //que vino desde el back
      return { ...state, userInfo: action.payload };
    }

    case 'USER_SIGNOUT': {
      return {
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
          shippingOption: '',
        },
      };
    }
    //Lo único que se cambiará en el estado es el cart, y lo único del cart es la shippingAddress
    //entonces...
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state, //no tocamos otros campos en el state más que el cart
        cart: {
          ...state.cart, //y del cart lo único es la shippingAddress
          shippingAddress: action.payload,
        },
      };

    case 'SAVE_SHIPPING_OPTION':
      return {
        ...state, //no tocamos otros campos en el state más que el cart
        cart: {
          ...state.cart, //y del cart lo único es la shippingAddress
          shippingOption: action.payload,
        },
      };

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };

    default:
      return state;
  }
}

//StoreProvider construye la vista pasando el Store, que extrae lo necesario del estado
//y despachará nuevas acciones. Pasa las propiedades globales to children
//Esta es una higher-order function que recibe "props"
export function StoreProvider(props) {
  //useReducer acepta dos parámetros, el reducer que tenemos que implementar y el default or initial state
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  //El {value} es el objeto definido arriba, que contiene el estado actual y el dispatch para actualizar el estado
  //se renderiza {props.children}
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

//Para usar StoreProvider, tenemos que poner a toda la app (index.js) dentro de <StoreProvider>
