import Button from 'react-bootstrap/Button';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { formatAddress } from '../../helpers/format-address';
import { useEffect } from 'react';

export const ConnectWalletButton = () => {
	const { address, isConnected } = useAccount();
	
    const { connect, reset } = useConnect({
        connector: new InjectedConnector(),
      })

	  useEffect(() => {
		(async () => {
			if(localStorage.getItem('is18') === 'true') {
				await connect()
			}
		})();
	  }, [])

	if (isConnected && address)
		return (
			<Button variant="info" onClick={() => reset()}>
				{formatAddress(address)}
			</Button>
		);
	return (
		<Button variant="info" onClick={() => connect()}>
			Connect
		</Button>
	);
};
