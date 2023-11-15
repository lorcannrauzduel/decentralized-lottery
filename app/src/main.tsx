import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { WagmiConfig, createConfig, sepolia } from 'wagmi';
import { createPublicClient, http } from 'viem';

const config = createConfig({
	autoConnect: false,
	publicClient: createPublicClient({
		chain: sepolia,
		transport: http(),
	}),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WagmiConfig config={config}>
			<App />
		</WagmiConfig>
	</React.StrictMode>
);
