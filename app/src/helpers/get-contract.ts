import { ethers } from 'ethers';
import { getABI } from './get-abi';

export const getContract = async () => {
	const abi = getABI();
	const provider = new ethers.BrowserProvider(window.ethereum);
	const signer = await provider.getSigner();
	const contract = new ethers.Contract(
		import.meta.env.VITE_CONTRACT_ADDRESS,
		abi,
		signer
	);
	return contract
};