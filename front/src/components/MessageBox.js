import Alert from 'react-bootstrap/Alert'

export default function MessageBox(props){
    return (
        //Si variant existe lo seteamos a variant, si no le seteamos 'info' como default
        //y rendeamos el contenido de children
        //Por ejemplo en HomeScreen cuando sucede un error, se pasa como variant="alert" (mensaje en rojo)
        //Y lo  que viene de children es el mensaje de error
        <Alert variant={props.variant || 'info'}>{props.children}</Alert>
    );
}