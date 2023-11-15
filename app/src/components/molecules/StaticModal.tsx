import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const StaticModal = () => {
  const [show, setShow] = useState(() => {
    const is18 = localStorage.getItem('is18');
    return is18 === 'true' ? false : true;
  });

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('is18', 'true');
  }
  const handleShow = () => setShow(true);

  return (
    <>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Attention</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ce site comporte un jeu de hasard. Il est interdit aux mineurs de moins de 18 ans, en continuant vous certifiez avoir plus de 18 ans. Aller sur <a href="https://www.joueurs-info-service.fr/">Joueurs Info Service</a> pour plus d'informations.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>J'ai plus de 18 ans</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}