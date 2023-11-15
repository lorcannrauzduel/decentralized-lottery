/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ targetTimestamp }: any) => {
	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		const targetDate: any = new Date(targetTimestamp * 1000);

		const updateCountdown = () => {
			const currentTime: any = new Date();
			const difference = targetDate - currentTime;

			if (difference <= 0) {
				setTimeLeft('Terminé');
				return;
			}

			// Calculer jours, heures, minutes et secondes
			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((difference / 1000 / 60) % 60);
			const seconds = Math.floor((difference / 1000) % 60);

			setTimeLeft(
				`${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`
			);
		};

		updateCountdown();

		const intervalId = setInterval(updateCountdown, 1000);

		return () => clearInterval(intervalId);
	}, [targetTimestamp]);

	return (
		<div
			style={{
				marginLeft: '3px',
			}}
		>
			{timeLeft}
		</div>
	);
};
