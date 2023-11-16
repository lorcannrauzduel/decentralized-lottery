import contractJSON from '../../../artifacts/contracts/DLottery.sol/DLottery.json';

export const getABI = () => {
	const abi = contractJSON.abi;
	return abi;
};
