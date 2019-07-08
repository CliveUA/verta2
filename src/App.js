import React, { Component } from "react";
import "./App.css";
import Header from "./header";
import Source from "./source";
import Target from "./target";
import ExchangeRate from "./exchangeRate";
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			currencies: [],
			source: "USD",
			target: "NGN",
			sourceAmount: 1,
			targetAmount: 0,
			sourceName: "United States Dollar",
			targetName: "Nigerian Naira",
			exchangeRate: 0,
			sourceEdited: true,
		};

		this.handleSourceAmountChange = this.handleSourceAmountChange.bind(this);
		this.handleTargetAmountChange = this.handleTargetAmountChange.bind(this);
		this.handleSourceChange = this.handleSourceChange.bind(this);
		this.handleTargetChange = this.handleTargetChange.bind(this);
		this.handleSwap = this.handleSwap.bind(this);
		this.handleAppReload = this.handleAppReload.bind(this);
	}

	config() {
		const config = {
			converterApiUrl: "https://free.currencyconverterapi.com/api/v6",
			converterApiKey: "9c7fce0efa79eb8b5acc",
			countryApiUrl: "https://www.countryflags.io"
		};

		return config;
	}

	async componentDidMount() {
		this.getLastConversion();
		await this.getCurrencies();
		await this.convertSource();

		// set the default option's text to its currency id
		document.querySelector('#sourceCurrency')
			.options[0].innerHTML = this.state.source;
		document.querySelector('#targetCurrency')
			.options[0].innerHTML = this.state.target;
	}

	getLastConversion() {
		const lastConversion = window.localStorage.getItem("lastConversion");

		if (lastConversion !== null) {
			const data = JSON.parse(lastConversion);

			this.setState({
				source: data.source,
				target: data.target,
				sourceName: data.sourceName,
				targetName: data.targetName,
			});
		}
	}

	async getCurrencies() {
		const cachedCurrencies = window.localStorage.getItem("currencies");

		if (cachedCurrencies !== null) {
			this.setState({
				currencies: JSON.parse(cachedCurrencies)
			});

			return;
		} else {
			// if not, fetch it from the API
			const currenciesEndpoint = `${
				this.config().converterApiUrl}/currencies?apiKey=${
				this.config().converterApiKey}`;

			try {
				const response = await fetch(currenciesEndpoint);
				const data = await response.json();
				const currencies = this.sortCurrencies(data.results);

				this.setState({
					currencies: currencies
				});

				// Cache the list of currencies in local storage
				window.localStorage.setItem("currencies", JSON.stringify(currencies));
			} catch (error) {
				throw new Error(
					"There was a problem getting the currencies: ",
					error.message
				);
			}
		}
	}

	sortCurrencies(currencies) {
		const sortedCurrencies = Object.values(currencies).sort((a, b) => {
			if (a.id < b.id) { return -1 };
			if (a.id > b.id) { return 1 };

			return 0;
		});

		return sortedCurrencies;
	}

	async convertSource(useCachedRate, amount) {
		amount
			? this.convertCurrency(0, useCachedRate, amount)
			: this.convertCurrency(0, useCachedRate, this.state.sourceAmount);
	}

	async convertTarget(useCachedRate, amount) {
		amount
			? this.convertCurrency(1, useCachedRate, amount)
			: this.convertCurrency(0, useCachedRate, this.state.targetAmount);
	}

	async convertCurrency(mode, useCachedRate, amount) {
		if (!useCachedRate) {
			await this.getRate();
		}

		if (mode === 0) {
			this.setState({
				targetAmount: (amount * this.state.exchangeRate).toFixed(2)
			});
		} else if (mode === 1) {
			this.setState({
				sourceAmount: (amount / this.state.exchangeRate).toFixed(2)
			});
		}

		// cache the converted currency codes
		window.localStorage.setItem(
			"lastConversion",
			JSON.stringify({
				source: this.state.source,
				target: this.state.target,
				sourceName: this.state.sourceName,
				targetName: this.state.targetName,
			})
		);
	}

	async getRate() {
		const convertEndpoint = `${
			this.config().converterApiUrl}/convert?q=${
			this.state.source}_${this.state.target}&compact=ultra&apiKey=${
			this.config().converterApiKey}`;

		try {
			const response = await fetch(convertEndpoint);
			const data = await response.json(); // e.g {"USD_NGN":360.000344}
			const exchangeRate = Object.entries(data)[0][1] // 360.000344

			this.setState({
				exchangeRate: exchangeRate
			});

		} catch (error) {
			throw new Error('There was a problem getting the rates: ', error.message);
		}
	}

	handleSourceAmountChange(e) {
		const amount = e.target.value;

		this.setState({
			sourceAmount: amount,
			sourceEdited: true,
		}, () => this.convertSource(true, amount));
	}

	handleTargetAmountChange(e) {
		const amount = e.target.value;

		this.setState({
			targetAmount: amount,
			sourceEdited: false,
		}, () => this.convertTarget(true, amount));
	}

	handleSourceChange(e) {
		const currency = this.state.currencies.find(currency => (currency.id === e.target.value));

		this.setState({
			source: e.target.value,
			sourceName: currency.currencyName,
		}, this.convertLastEdited);

		// set selected option's text to its currency id
		e.target.options[0].innerHTML = e.target.value;
	}

	handleTargetChange(e) {
		const currency = this.state.currencies.find(currency => (currency.id === e.target.value));

		this.setState({
			target: e.target.value,
			targetName: currency.currencyName,
		}, this.convertLastEdited);

		// set selected option's text to its currency id
		e.target.options[0].innerHTML = e.target.value;
	}

	async convertLastEdited() {
		await this.state.sourceEdited
			? this.convertSource()
			: this.convertTarget()
	}

	handleSwap() {
		const source = this.state.source;
		const target = this.state.target;
		const sourceName = this.state.sourceName;
		const targetName = this.state.targetName;

		this.setState({
			source: target,
			target: source,
			sourceName: targetName,
			targetName: sourceName,
		}, this.convertLastEdited);
	}

	handleAppReload() {
		window.localStorage.removeItem("currencies");
		window.localStorage.removeItem("lastConversion");
		window.location.reload();
	}

	render() {
		return (
			<React.Fragment>
				<Header handleSwap={this.handleSwap} handleAppReload={this.handleAppReload} />
				<main className="main">
					<div className="card ">
						<div className="converter">
							<Source
								currencies={this.state.currencies}
								source={this.state.source}
								handleSourceChange={this.handleSourceChange}
								sourceAmount={this.state.sourceAmount}
								handleSourceAmountChange={this.handleSourceAmountChange}
							/>
							<Target
								currencies={this.state.currencies}
								target={this.state.target}
								handleTargetChange={this.handleTargetChange}
								targetAmount={this.state.targetAmount}
								handleTargetAmountChange={this.handleTargetAmountChange}
							/>
						</div>
					</div>
					<ExchangeRate
						sourceName={this.state.sourceName}
						targetName={this.state.targetName}
						exchangeRate={this.state.exchangeRate.toFixed(2)}
					/>
				</main>
			</React.Fragment>
		);
	}
}

export default App;