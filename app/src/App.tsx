/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar } from './components/templates/Navbar';
import Button from 'react-bootstrap/Button';
import { Toaster } from 'react-hot-toast';
import { CountdownTimer } from './components/atoms/CountdownTimer';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import Spinner from 'react-bootstrap/Spinner';
import { StaticModal } from './components/molecules/StaticModal';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { Status, useContract } from './hooks/useContract';
import { useEffect } from 'react';

declare global {
	interface Window {
		ethereum: any;
	}
}

const App = () => {
	const { width, height } = useWindowSize();
	const {
		winner,
		status,
		endTime,
		participants,
		potentialGain,
		priceInETH,
		handleBuyTicket,
		handleClaim,
		handleGetWinner,
		owner,
		isBuyTicketPending,
		isClaimPending,
		isGetWinnerPending,
		isLoading,
	} = useContract();

	useEffect(() => {}, [status, isLoading]);
	if (isLoading)
		return (
			<div
				className="d-flex align-items-center justify-content-center"
				style={{ height: '100vh' }}
			>
				<Spinner animation="border" role="status" />
			</div>
		);
	return (
		<>
			<StaticModal />

			{winner && <Confetti width={width!} height={height!} />}
			<Toaster />
			<Navbar />
			<Container>
				<Card className="mt-5">
					<Card.Body>
						<Card.Subtitle className="mb-2">
							<strong>Status:</strong>{' '}
							{status === Status.NOT_STARTED &&
							new Date().getTime() < endTime * 1000
								? 'Vente de billet en cours'
								: status === Status.NOT_STARTED &&
								  new Date().getTime() > endTime * 1000
								? 'Vente de billet terminée'
								: status === Status.STARTED
								? 'Tirage au sort en cours'
								: 'Tirage au sort terminé'}
						</Card.Subtitle>
						<Card.Subtitle className="d-flex mb-2 text-muted">
							<strong>Temps restant:</strong>{' '}
							<CountdownTimer targetTimestamp={endTime} />
						</Card.Subtitle>
						<Card.Subtitle className="mb-2 text-muted">
							<strong>Nombre de participants:</strong>{' '}
							{participants ? participants.toString() : '0'}
						</Card.Subtitle>
						<Card.Subtitle className="mb-2 text-muted">
							<strong>Prix du ticket:</strong> {priceInETH} ETH
						</Card.Subtitle>
						<Card.Subtitle className="mb-2 text-muted">
							<strong>Gain potentiel:</strong> {potentialGain} ETH
						</Card.Subtitle>
						{/* <C */}
						<Card.Text>
							{status === Status.NOT_STARTED &&
								new Date().getTime() < endTime * 1000 && (
									<>
										Venez participer à notre grand tirage au sort pour gagner un
										magnifique cadeau ! Connectez votre wallet et acheter un
										ticket pour participer ! Vous n'avez pas de wallet ?{' '}
										<a href="https://metamask.io/download.html">
											Télécharger Metamask
										</a>{' '}
										!
									</>
								)}
							{status === Status.NOT_STARTED &&
								new Date().getTime() > endTime * 1000 && (
									<>
										La vente de billet est terminée, le tirage au sort va
										bientôt commencer !
									</>
								)}
							{status === Status.STARTED && (
								<>
									Le tirage au sort est en cours..
									<div
										style={{
											marginBottom: '10px',
										}}
									>
										<Spinner animation="border" role="status" />
									</div>
								</>
							)}
							{winner && status === Status.ENDED && (
								<>Le grand gagnant est {winner} ! Bravo à lui !</>
							)}
						</Card.Text>
						<Button
							variant="secondary"
							onClick={handleBuyTicket}
							disabled={new Date().getTime() > endTime * 1000}
						>
							{isBuyTicketPending && (
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>
							)}
							Acheter un ticket
						</Button>
						<Button
							variant="secondary"
							onClick={handleClaim}
							disabled={status !== Status.ENDED || isClaimPending}
							style={{
								marginLeft: '10px',
							}}
						>
							{isClaimPending && (
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>
							)}
							Obtenir les gains
						</Button>
						<Button
							variant="secondary"
							onClick={handleGetWinner}
							disabled={
								window.ethereum.selectedAddress
									? window.ethereum.selectedAddress.toLowerCase() !==
									  owner.toLowerCase()
									: true
							}
							style={{
								marginLeft: '10px',
							}}
						>
							{isGetWinnerPending && (
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>
							)}
							Lancer le tirage au sort
						</Button>
					</Card.Body>
				</Card>
			</Container>
		</>
	);
};

export default App;
