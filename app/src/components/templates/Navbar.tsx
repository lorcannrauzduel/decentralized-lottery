import Container from 'react-bootstrap/Container';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import { ConnectWalletButton } from '../atoms/ConnectWalletButton';

export const Navbar = () => {
	return (
		<BootstrapNavbar
			className="bg-body-tertiary"
			bg="dark"
			data-bs-theme="dark"
		>
			<Container>
				<BootstrapNavbar.Brand href="#home">
					<img src="logo.png" width={50} height={50}/>
				</BootstrapNavbar.Brand>
				<BootstrapNavbar.Toggle />
				<BootstrapNavbar.Collapse className="justify-content-end">
					<BootstrapNavbar.Text>
						<ConnectWalletButton />
					</BootstrapNavbar.Text>
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};
