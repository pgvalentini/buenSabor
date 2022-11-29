import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';

export default function NotFoundScreen() {
  return (
    <Container className="small-container">
      <Helmet>
        <title>Página no encontrada</title>
      </Helmet>

      <h1 className="my-3">404 Página no encontrada</h1>
    </Container>
  );
}
