/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
	getContract,
} from '../helpers/get-contract';
import { toast } from 'react-hot-toast';
import { formatEther } from 'ethers';
import { useAccount } from 'wagmi';
import { SEPOLIA_CHAIN_ID } from '../constants/chain';
import { decodeErrorResult } from 'viem';
import { getContractBalance } from '../helpers/get-contract-balance';
import { getABI } from '../helpers/get-abi';

export enum Status {
	NOT_STARTED,
	STARTED,
	ENDED,
}

export const useContract = () => {
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
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setupApp();
		(async () => {
			window.ethereum.on('chainChanged', async (chainId: any) => {
				// if different of sepolia
				if (chainId !== SEPOLIA_CHAIN_ID) {
					return await window.ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{ chainId: SEPOLIA_CHAIN_ID }],
					});
				}
			});
			if (!window.ethereum.selectedAddress) return;
			const contract = await getContract();
			contract.on('RequestedRandomness', () => {
				return setStatus(Status.STARTED);
			});
			contract.on('RequestedRandomnessFulfilled', (requestId, winner) => {
				setWinner(winner);
				return setStatus(Status.ENDED);
			});
		})();
	}, []);

	const setupApp = async () => {
		setIsLoading(true);
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: SEPOLIA_CHAIN_ID }],
		});
		const contract = await getContract();
		const ownerAddress = await contract.owner();
		setOwner(ownerAddress);
		const nbParticipants = await contract.getParticipants();
		setParticipants(Number(nbParticipants));
		const priceInETH = await contract.TICKET_PRICE();
		setPriceInETH(Number(formatEther(priceInETH)));
		const balance = await getContractBalance();
		setPotentialGain(Number(formatEther(balance)));
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
				setWinner(await contract.getWinner());
				setStatus(Status.ENDED);
				break;
			default:
				break;
		}
		setIsLoading(false);
	};
	const handleBuyTicket = async () => {
		setIsBuyTicketPending(true);
		const contract = await getContract();
		const ticketPrice = await contract.TICKET_PRICE();
		try {
			const tx = await contract.buyTicket(address, {
				value: ticketPrice,
			});
			await tx.wait();
			toast.success('Ticket acheté !');
		} catch (error: any) {
			const { errorName } = decodeErrorResult({
				abi: getABI(),
				data: error.data,
			});

			const reason = errorName || error.message;
			toast.error(reason);
		}
		setIsBuyTicketPending(false);
	};

	const handleGetWinner = async () => {
		setIsGetWinnerPending(true);
		const contract = await getContract();
		try {
			const tx = await contract.start({
				gasLimit: 100000,
			});
			await tx.wait();
			toast.success('Tirage au sort en cours !');
		} catch (error: any) {
			const { errorName } = decodeErrorResult({
				abi: getABI(),
				data: error.data,
			});
			const reason = errorName || error.message;
			toast.error(reason);
		}
		setIsGetWinnerPending(false);
	};

	const handleClaim = async () => {
		setIsClaimPending(true);
		const contract = await getContract();
		try {
			const tx = await contract.claim({
				gasLimit: 300000,
			});
			await tx.wait();
			toast.success('Gains envoyés !');
		} catch (error: any) {
			const { errorName } = decodeErrorResult({
				abi: getABI(),
				data: error.data,
			});

			const reason = errorName || error.message;
			toast.error(reason);
		}
		setIsClaimPending(false);
	};

	return {
		winner,
		setWinner,
		endTime,
		status,
		setStatus,
		participants,
		setParticipants,
		priceInETH,
		setPriceInETH,
		potentialGain,
		setPotentialGain,
		isBuyTicketPending,
		setIsBuyTicketPending,
		isGetWinnerPending,
		setIsGetWinnerPending,
		isClaimPending,
		setIsClaimPending,
		handleBuyTicket,
		handleGetWinner,
		handleClaim,
		owner,
		setOwner,
		isLoading,
	};
};
