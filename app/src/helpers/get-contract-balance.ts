import { ethers } from 'ethers';

export const getContractBalance = async () => {
	const provider = new ethers.BrowserProvider(window.ethereum);
	const balance = await provider.getBalance(
		import.meta.env.VITE_CONTRACT_ADDRESS
	);
	return balance;
};
