import React, { Fragment, useState, useEffect } from "react";
import "./App.css";
import Header from "./header";
import Source from "./source";
import Target from "./target";
import ExchangeRate from "./exchangeRate";

function Converter() {
	const [currencies, setCurrencies] = useState([]);
	const [source, setSource] = useState("USD");
	const [target, setTarget] = useState("NGN");
	const [sourceAmount, setSourceAmount] = useState(1);
	const [targetAmount, setTargetAmount] = useState(0);
	const [sourceName, setSourceName] = useState("United States Dollar");
	const [targetName, setTargetName] = useState("Nigerian Naira");
	const [exchangeRate, setExchangeRate] = useState(0);
	const [sourceEdited, setSourceEdited] = useState(true);

	function config() {
		return {
			converterApiUrl: "https://free.currconv.com/api/v7",
			// converterApiKey: "9c7fce0efa79eb8b5acc",
			converterApiKey: "62c4c2604c6460a3c25f",
			countryApiUrl: "https://www.countryflags.io"
		};
	}

	useEffect(() => {
		getLastConversion();
		getCurrencies();
	}, []);

	useEffect(() => {
		convertLastEdited();

		document.querySelector('#sourceCurrency').options[0].innerHTML = source;
		document.querySelector('#targetCurrency').options[0].innerHTML = target;
	}, [source, target]);

	function getLastConversion() {
		const lastConversion = window.localStorage.getItem("lastConversion");

		if (lastConversion !== null) {
			const data = JSON.parse(lastConversion);

			setSource(data.source);
			setTarget(data.target);
			setSourceName(data.sourceName);
			setTargetName(data.targetName);
		}
	}

	async function getCurrencies() {
		const cachedCurrencies = window.localStorage.getItem("currencies");

		if (cachedCurrencies !== null) {
			console.log("Using cached currencies.");
			setCurrencies(JSON.parse(cachedCurrencies));
			return;
		} else {
			console.log("Fetched currencies from the API.");
			// Cache is empty, so fetch currencies from the API
			const currenciesEndpoint = `
				${config().converterApiUrl}/currencies?apiKey=${config().converterApiKey}`;

			try {
				const response = await fetch(currenciesEndpoint);
				const data = await response.json();
				const currencies = sortCurrencies(data.results);

				setCurrencies(currencies);

				// Cache the list of currencies in local storage
				window.localStorage.setItem("currencies", JSON.stringify(currencies));
			} catch (error) {
				throw new Error(
					"There was a problem getting the currencies: ",
					error.message
				);
			}
		}

		// Helper function for sorting currencies
		function sortCurrencies(currencies) {
			const sortedCurrencies = Object.values(currencies).sort((a, b) => {
				if (a.id < b.id) { return -1 };
				if (a.id > b.id) { return 1 };
				return 0;
			});
	
			return sortedCurrencies;
		}
	}

	async function convertLastEdited() {
		return await sourceEdited ? convertSource() : convertTarget();
	}

	async function convertSource(amount, useCachedRate) {
		return amount ? 
			convertCurrency(0, amount, useCachedRate) : 
			convertCurrency(0, sourceAmount, useCachedRate);
	}

	async function convertTarget(amount, useCachedRate) {
		return amount ? 
			convertCurrency(1, amount, useCachedRate) : 
			convertCurrency(1, targetAmount, useCachedRate);
	}

	async function convertCurrency(mode, amount, useCachedRate) {
		const rate = useCachedRate ? exchangeRate : await getRate();

		if (mode === 0) {
			setTargetAmount((amount * rate).toFixed(2));
		} else if (mode === 1) {
			setSourceAmount((amount / rate).toFixed(2));
		}

		setExchangeRate(rate);

		// cache the converted currency codes
		window.localStorage.setItem(
			"lastConversion",
			JSON.stringify({
				source: source,
				target: target,
				sourceName: sourceName,
				targetName: targetName,
			})
		);
	}

	async function getRate() {
		const convertEndpoint = `${
			config().converterApiUrl}/convert?q=${source}_${target}&compact=ultra&apiKey=${
			config().converterApiKey}`;

		try {
			const response = await fetch(convertEndpoint);
			const data = await response.json(); // e.g {"USD_NGN":360.000344}
			const rate = Object.entries(data)[0][1] // 360.000344
			
			return rate;
		} catch (error) {
			throw new Error('There was a problem getting the rates: ', error.message);
		}
	}

	function handleSourceAmountChange(e) {
		const amount = e.target.value;

		setSourceAmount(amount);
		setSourceEdited(true);
		convertSource(amount, true);
	}

	function handleTargetAmountChange(e) {
		const amount = e.target.value;

		setTargetAmount(amount);
		setSourceEdited(false);
		convertTarget(amount, true);
	}

	function handleSourceChange(e) {
		if (source !== e.target.value) {
			setSource(e.target.value);
			
			const currency = currencies.find(currency => (currency.id === e.target.value));
			setSourceName(currency.currencyName);			
		}
		// set selected option's text to its currency id
		e.target.options[0].innerHTML = e.target.value;
	}

	function handleTargetChange(e) {
		if (target !== e.target.value) {
			setTarget(e.target.value);
			
			const currency = currencies.find(currency => (currency.id === e.target.value));
			setTargetName(currency.currencyName);
		}
		// set selected option's text to its currency id
		e.target.options[0].innerHTML = e.target.value;
	}

	async function handleSwap() {
		setSource(target);
		setTarget(source);
		setSourceName(targetName);
		setTargetName(sourceName);
	}

	function handleAppReload() {
		window.localStorage.removeItem("currencies");
		window.localStorage.removeItem("lastConversion");
		window.location.reload();
	}

	return (
		<Fragment>
			<Header handleSwap={handleSwap} handleAppReload={handleAppReload} />
			<main className="main">
				<article className="tab tab-converter tab--active">
					<div className="card">
						<div className="converter">
							<Source
								currencies={currencies}
								source={source}
								handleSourceChange={handleSourceChange}
								sourceAmount={sourceAmount}
								handleSourceAmountChange={handleSourceAmountChange}
							/>
							<Target
								currencies={currencies}
								target={target}
								handleTargetChange={handleTargetChange}
								targetAmount={targetAmount}
								handleTargetAmountChange={handleTargetAmountChange}
							/>
						</div>
					</div>
					<ExchangeRate
						sourceName={sourceName}
						targetName={targetName}
						exchangeRate={exchangeRate.toFixed(2)}
					/>
				</article>
				<article className="tab tab-favorite">
					<div className="card">
						<div className="converter">
							<div className="converter__form">
								<div className="converter__input">
									<span className="converter__label">From</span>
									<div className="converter__input--number">1</div>
								</div>
								<div className="converter__currency">
									<img
										id="fromFlag" className="converter__flag"
										src="https://www.countryflags.io/EU/flat/32.png" alt="flag"
									/>
									<div className="converter__input-currency">EUR</div>
								</div>
							</div>
							<div className="converter__form">
								<div className="converter__input converter__input--last">
									<span className="converter__label">To</span>
									<div className="converter__input--number">400</div>
								</div>
								<div className="converter__currency converter__currency--last">
									<img
										id="fromFlag" className="converter__flag"
										src="https://www.countryflags.io/NG/flat/32.png" alt="flag"
									/>
									<div className="converter__input-currency">NGN</div>
								</div>
							</div>
						</div>
					</div>
				</article>
			</main>
		</Fragment>
	);
}

const App = () => <Converter />

export default App;