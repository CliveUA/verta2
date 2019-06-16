import React from 'react';
import arrowDown from './img/arrow-down.svg';

const Source = props => {
	return (
		<div className="converter__form">
			<div className="converter__input">
				<label className="converter__label" htmlFor="sourceInput">From</label>
				<input
					className="converter__input--number"
					type="number" name="sourceInput" id="sourceInput"
					value={props.sourceAmount} placeholder="0" step="0.01"
					onChange={props.handleSourceAmountChange} autoFocus
				/>
			</div>
			<div className="converter__currency">
				<img
					id="fromFlag" className="converter__flag"
					src={`https://www.countryflags.io/${props.source.substring(0, 2)}/flat/24.png`}
					alt="flag"
				/>
				<select className="converter__input-currency" name="sourceCurrency"
					id="sourceCurrency" value={props.source} onChange={props.handleSourceChange}>
					<option value="USD">USD</option>
					<option value="GBP">GBP</option>
					<option value="NGN">NGN</option>
					<option value="EUR">EUR</option>
					<option disabled></option>
					{
						Object.values(props.currencies).map(currency => (
							<option key={currency.id} value={currency.id}>{currency.id}</option>
						))
					}
				</select>
				<div className="converter__input-icon">
					<img src={arrowDown} alt="caret" width="11" height="6" />
				</div>
			</div>
		</div>
	);
}

export default Source;