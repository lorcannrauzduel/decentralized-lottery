/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar } from './components/templates/Navbar';
import Button from 'react-bootstrap/Button';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CountdownTimer } from './components/atoms/CountdownTimer';
import { getContract, getContractBalance } from './helpers/get-contract';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import Spinner from 'react-bootstrap/Spinner';
import { StaticModal } from './components/molecules/StaticModal';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { formatEther } from 'ethers';

declare global {
	interface Window {
		ethereum: any;
	}
}

enum Status {
	NOT_STARTED,
	STARTED,
	ENDED,
}

const App = () => {
	const { width, height } = useWindowSize();
	const { address } = useAccount();
	const [winner, setWinner] = useState('');
	const [endTime, setEndTime] = useState(0);
	const [status, setStatus] = useState(Status.NOT_STARTED);
	const [participants, setParticipants] = useState(0);
	const [priceInETH, setPriceInETH] = useState(0);
	const [potentialGain, setPotentialGain] = useState(0);
	const [isBuyTicketPending, setIsBuyTicketPending] = useState(false);
	const [isGetWinnerPending, setIsGetWinnerPending] = useState(false);
	const [isClaimPending, setIsClaimPending] = useState(false);
	const [owner, setOwner] = useState('');

	const handleBuyTicket = async () => {
		setIsBuyTicketPending(true);
		const contract = await getContract();
		const ticketPrice = await contract.TICKET_PRICE();
		try {
			const buyTicketResponse = await contract.buyTicket(address, {
				value: ticketPrice,
			});
			await buyTicketResponse.wait();
		} catch (error: any) {
			const reason = error.reason || error.message;
			toast.error(reason);
		}
		setIsBuyTicketPending(false);
	};

	const handleGetWinner = async () => {
		setIsGetWinnerPending(true);
		const contract = await getContract();
		try {
			const winner = await contract.roll({
				gasLimit: 300000,
			});
			await winner.wait();
		} catch (error: any) {
			console.log({ error });
			const reason = error.reason || error.message;
			toast.error(reason);
		}
		setIsGetWinnerPending(false);
	};

	const handleClaim = async () => {
		setIsClaimPending(true);
		const contract = await getContract();
		try {
			const claimResponse = await contract.claim({
				gasLimit: 300000,
			});
			await claimResponse.wait();
		} catch (error: any) {
			const reason = error.reason || error.message;
			toast.error(reason);
		}
		setIsClaimPending(false);
	};

	useEffect(() => {
		(async () => {
			if (!window.ethereum.selectedAddress) return;
			const contract = await getContract();
			const ownerAddress = await contract.owner();
			setOwner(ownerAddress);
			const nbParticipants = await contract.getParticipants();
			setParticipants(Number(nbParticipants));
			const priceInETH = await contract.TICKET_PRICE();
			setPriceInETH(Number(formatEther(priceInETH)));
			const balance = await getContractBalance();
			setPotentialGain(Number(formatEther(balance)));
			contract.on('RequestedRandomness', () => {
				return setStatus(Status.STARTED);
			});
			contract.on('SelectedWinner', (address: any) => {
				setWinner(address);
				return setStatus(Status.ENDED);
			});

			const endTime = await contract.endTime();
			setEndTime(Number(endTime));

			const state = Number(await contract.currentState());
			switch (state) {
				case 0:
					setStatus(Status.NOT_STARTED);
					break;
				case 1:
					setStatus(Status.STARTED);
					break;
				case 2:
					setWinner(await contract.winner());
					setStatus(Status.ENDED);
					break;
				default:
					break;
			}
		})();
	}, []);

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
							disabled={window.ethereum.selectedAddress ? window.ethereum.selectedAddress.toLowerCase() !== owner.toLowerCase() : true}
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
