import Spinner from 'react-bootstrap/Spinner'

export default function LoadingBox(){
    return (<Spinner animation="border" role="status" variant="warning">
        <span className="visually-hidden">Cargando...</span>
    </Spinner>
    );
}