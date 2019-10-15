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
		convertSource();

		document.querySelector('#sourceCurrency').options[0].innerHTML = source;
		document.querySelector('#targetCurrency').options[0].innerHTML = target;
	}, []);

	useEffect(() => {
		convertLastEdited();
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
		let rate = 0;
		
		if (!useCachedRate) {
			rate = await getRate();
		}

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

	async function convertLastEdited() {
		return await sourceEdited ? convertSource() : convertTarget();
	}

	async function handleSwap() {
		setSource(target);
		setTarget(source);
		setSourceName(targetName);
		setTargetName(sourceName);

		convertLastEdited();
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

// class App extends Component {
	// constructor(props) {
	// 	super(props);

	// 	this.state = {
	// 		currencies: [],
	// 		source: "USD",
	// 		target: "NGN",
	// 		sourceAmount: 1,
	// 		targetAmount: 0,
	// 		sourceName: "United States Dollar",
	// 		targetName: "Nigerian Naira",
	// 		exchangeRate: 0,
	// 		sourceEdited: true,
	// 	};

	// 	this.handleSourceAmountChange = this.handleSourceAmountChange.bind(this);
	// 	this.handleTargetAmountChange = this.handleTargetAmountChange.bind(this);
	// 	this.handleSourceChange = this.handleSourceChange.bind(this);
	// 	this.handleTargetChange = this.handleTargetChange.bind(this);
	// 	this.handleSwap = this.handleSwap.bind(this);
	// 	this.handleAppReload = this.handleAppReload.bind(this);
	// }

	// config() {
	// 	const config = {
	// 		converterApiUrl: "https://free.currencyconverterapi.com/api/v6",
	// 		converterApiKey: "9c7fce0efa79eb8b5acc",
	// 		countryApiUrl: "https://www.countryflags.io"
	// 	};

	// 	return config;
	// }

	// async componentDidMount() {
	// 	this.getLastConversion();
	// 	await this.getCurrencies();
	// 	await this.convertSource();

	// 	// set the default option's text to its currency id
	// 	document.querySelector('#sourceCurrency')
	// 		.options[0].innerHTML = this.state.source;
	// 	document.querySelector('#targetCurrency')
	// 		.options[0].innerHTML = this.state.target;
	// }

	// getLastConversion() {
	// 	const lastConversion = window.localStorage.getItem("lastConversion");

	// 	if (lastConversion !== null) {
	// 		const data = JSON.parse(lastConversion);

	// 		this.setState({
	// 			source: data.source,
	// 			target: data.target,
	// 			sourceName: data.sourceName,
	// 			targetName: data.targetName,
	// 		});
	// 	}
	// }

	// async getCurrencies() {
	// 	const cachedCurrencies = window.localStorage.getItem("currencies");

	// 	if (cachedCurrencies !== null) {
	// 		this.setState({
	// 			currencies: JSON.parse(cachedCurrencies)
	// 		});

	// 		return;
	// 	} else {
	// 		// if not, fetch it from the API
	// 		const currenciesEndpoint = `${
	// 			this.config().converterApiUrl}/currencies?apiKey=${
	// 			this.config().converterApiKey}`;

	// 		try {
	// 			const response = await fetch(currenciesEndpoint);
	// 			const data = await response.json();
	// 			const currencies = this.sortCurrencies(data.results);

	// 			this.setState({
	// 				currencies: currencies
	// 			});

	// 			// Cache the list of currencies in local storage
	// 			window.localStorage.setItem("currencies", JSON.stringify(currencies));
	// 		} catch (error) {
	// 			throw new Error(
	// 				"There was a problem getting the currencies: ",
	// 				error.message
	// 			);
	// 		}
	// 	}
	// }

	// sortCurrencies(currencies) {
	// 	const sortedCurrencies = Object.values(currencies).sort((a, b) => {
	// 		if (a.id < b.id) { return -1 };
	// 		if (a.id > b.id) { return 1 };

	// 		return 0;
	// 	});

	// 	return sortedCurrencies;
	// }

	// async convertSource(useCachedRate, amount) {
	// 	amount
	// 		? this.convertCurrency(0, useCachedRate, amount)
	// 		: this.convertCurrency(0, useCachedRate, this.state.sourceAmount);
	// }

	// async convertTarget(useCachedRate, amount) {
	// 	amount
	// 		? this.convertCurrency(1, useCachedRate, amount)
	// 		: this.convertCurrency(0, useCachedRate, this.state.targetAmount);
	// }

	// async convertCurrency(mode, useCachedRate, amount) {
	// 	if (!useCachedRate) {
	// 		await this.getRate();
	// 	}

	// 	if (mode === 0) {
	// 		this.setState({
	// 			targetAmount: (amount * this.state.exchangeRate).toFixed(2)
	// 		});
	// 	} else if (mode === 1) {
	// 		this.setState({
	// 			sourceAmount: (amount / this.state.exchangeRate).toFixed(2)
	// 		});
	// 	}

	// 	// cache the converted currency codes
	// 	window.localStorage.setItem(
	// 		"lastConversion",
	// 		JSON.stringify({
	// 			source: this.state.source,
	// 			target: this.state.target,
	// 			sourceName: this.state.sourceName,
	// 			targetName: this.state.targetName,
	// 		})
	// 	);
	// }

	// async getRate() {
	// 	const convertEndpoint = `${
	// 		this.config().converterApiUrl}/convert?q=${
	// 		this.state.source}_${this.state.target}&compact=ultra&apiKey=${
	// 		this.config().converterApiKey}`;

	// 	try {
	// 		const response = await fetch(convertEndpoint);
	// 		const data = await response.json(); // e.g {"USD_NGN":360.000344}
	// 		const exchangeRate = Object.entries(data)[0][1] // 360.000344

	// 		this.setState({
	// 			exchangeRate: exchangeRate
	// 		});

	// 	} catch (error) {
	// 		throw new Error('There was a problem getting the rates: ', error.message);
	// 	}
	// }

	// handleSourceAmountChange(e) {
	// 	const amount = e.target.value;

	// 	this.setState({
	// 		sourceAmount: amount,
	// 		sourceEdited: true,
	// 	}, () => this.convertSource(true, amount));
	// }

	// handleTargetAmountChange(e) {
	// 	const amount = e.target.value;

	// 	this.setState({
	// 		targetAmount: amount,
	// 		sourceEdited: false,
	// 	}, () => this.convertTarget(true, amount));
	// }

	// handleSourceChange(e) {
	// 	if (this.state.source !== e.target.value) {
	// 		const currency = this.state.currencies.find(currency => (currency.id === e.target.value));

	// 		this.setState({
	// 			source: e.target.value,
	// 			sourceName: currency.currencyName,
	// 		}, this.convertLastEdited);
	// 	}

	// 	// set selected option's text to its currency id
	// 	e.target.options[0].innerHTML = e.target.value;
	// }

	// handleTargetChange(e) {
	// 	if (this.state.target !== e.target.value) {
	// 		const currency = this.state.currencies.find(currency => (currency.id === e.target.value));

	// 		this.setState({
	// 			target: e.target.value,
	// 			targetName: currency.currencyName,
	// 		}, this.convertLastEdited);
	// 	}

	// 	// set selected option's text to its currency id
	// 	e.target.options[0].innerHTML = e.target.value;
	// }

	// async convertLastEdited() {
	// 	await this.state.sourceEdited
	// 		? this.convertSource()
	// 		: this.convertTarget()
	// }

	// handleSwap() {
	// 	const source = this.state.source;
	// 	const target = this.state.target;
	// 	const sourceName = this.state.sourceName;
	// 	const targetName = this.state.targetName;

	// 	this.setState({
	// 		source: target,
	// 		target: source,
	// 		sourceName: targetName,
	// 		targetName: sourceName,
	// 	}, this.convertLastEdited);
	// }

	// handleAppReload() {
	// 	window.localStorage.removeItem("currencies");
	// 	window.localStorage.removeItem("lastConversion");
	// 	window.location.reload();
	// }

	// render() {
	// 	return (
	// 		<React.Fragment>
	// 			<Header handleSwap={this.handleSwap} handleAppReload={this.handleAppReload} />
	// 			<main className="main">
	// 				<article className="tab tab-converter tab--active">
	// 					<div className="card">
	// 						<div className="converter">
	// 							<Source
	// 								currencies={this.state.currencies}
	// 								source={this.state.source}
	// 								handleSourceChange={this.handleSourceChange}
	// 								sourceAmount={this.state.sourceAmount}
	// 								handleSourceAmountChange={this.handleSourceAmountChange}
	// 							/>
	// 							<Target
	// 								currencies={this.state.currencies}
	// 								target={this.state.target}
	// 								handleTargetChange={this.handleTargetChange}
	// 								targetAmount={this.state.targetAmount}
	// 								handleTargetAmountChange={this.handleTargetAmountChange}
	// 							/>
	// 						</div>
	// 					</div>
	// 					<ExchangeRate
	// 						sourceName={this.state.sourceName}
	// 						targetName={this.state.targetName}
	// 						exchangeRate={this.state.exchangeRate.toFixed(2)}
	// 					/>
	// 				</article>
	// 				<article className="tab tab-favorite">
	// 					<div className="card">
	// 						<div className="converter">
	// 							<div className="converter__form">
	// 								<div className="converter__input">
	// 									<span className="converter__label">From</span>
	// 									<div className="converter__input--number">1</div>
	// 								</div>
	// 								<div className="converter__currency">
	// 									<img
	// 										id="fromFlag" className="converter__flag"
	// 										src="https://www.countryflags.io/EU/flat/32.png" alt="flag"
	// 									/>
	// 									<div className="converter__input-currency">EUR</div>
	// 								</div>
	// 							</div>
	// 							<div className="converter__form">
	// 								<div className="converter__input converter__input--last">
	// 									<span className="converter__label">To</span>
	// 									<div className="converter__input--number">400</div>
	// 								</div>
	// 								<div className="converter__currency converter__currency--last">
	// 									<img
	// 										id="fromFlag" className="converter__flag"
	// 										src="https://www.countryflags.io/NG/flat/32.png" alt="flag"
	// 									/>
	// 									<div className="converter__input-currency">NGN</div>
	// 								</div>
	// 							</div>
	// 						</div>
	// 					</div>
	// 				</article>
	// 			</main>
	// 		</React.Fragment>
	// 	);
	// }
// }

export default App;