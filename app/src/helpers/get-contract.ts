import { ethers } from 'ethers';
import contractJSON from '../../../artifacts/contracts/DLottery.sol/DLottery.json';

export const getContract = async () => {
	const abi = contractJSON.abi;
	const provider = new ethers.BrowserProvider(window.ethereum);
	const signer = await provider.getSigner();
	const contract = new ethers.Contract(
		import.meta.env.VITE_CONTRACT_ADDRESS,
		abi,
		signer
	);
	return contract;
};

export const getContractBalance = async () => {
	const provider = new ethers.BrowserProvider(window.ethereum);
	const balance = await provider.getBalance(
		import.meta.env.VITE_CONTRACT_ADDRESS
	);
	return balance;
}

