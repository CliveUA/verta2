import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./header";
import Converter from "./converter";
import Favorite from "./favorite";

function App() {
	const [currencies, setCurrencies] = useState([]);
	const [source, setSource] = useState("");
	const [target, setTarget] = useState("");
	const [sourceAmount, setSourceAmount] = useState(1);
	const [targetAmount, setTargetAmount] = useState(0);
	const [sourceName, setSourceName] = useState("");
	const [targetName, setTargetName] = useState("");
	const [exchangeRate, setExchangeRate] = useState(0);
	const [sourceEdited, setSourceEdited] = useState(true);
	const [activeTab, setActiveTab] = useState(0);
	const [favorites, setFavorites] = useState([]);

	function config() {
		return {
			converterApiUrl: "https://free.currconv.com/api/v7",
			// converterApiKey: "9c7fce0efa79eb8b5acc",
			converterApiKey: "62c4c2604c6460a3c25f",
			countryApiUrl: "https://www.countryflags.io"
		};
	}

	useEffect(() => {
		if (source === "") {
			fetchCurrencies();
			setDefaultConversion();
			getFavorites();
			return;
		}

		convertLastEdited();
	}, [source, target]);

	function setDefaultConversion() {
		const lastConversion = window.localStorage.getItem("lastConversion");

		if (lastConversion !== null) {
			const data = JSON.parse(lastConversion);

			setSource(data.source);
			setTarget(data.target);
			setSourceName(data.sourceName);
			setTargetName(data.targetName);
		} else {
			setSource("USD");
			setTarget("NGN");
			setSourceName("United States Dollar");
			setTargetName("Nigerian Naira");
		}
	}

	async function fetchCurrencies() {
		const cachedCurrencies = window.localStorage.getItem("currencies");

		if (cachedCurrencies !== null) {
			setCurrencies(JSON.parse(cachedCurrencies));
			return;
		} else {
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

	async function getFavorites() {
		const localFavorites = window.localStorage.getItem("favorites");

		if (localFavorites !== null) {
			const data = JSON.parse(localFavorites);
			const query = data.map(favorite => favorite.id).join(); 
			const rates = await fetchMultipleRates(query);

			const favorites = [];
			
			for (const item in rates) {
				if (rates.hasOwnProperty(item)) {
					const rate = rates[item];

					favorites.push({
						id: rate.id,
						rate: rate.val.toFixed(2),
						to: rate.to,
						from: rate.fr
					});
				}
			}

			setFavorites(favorites);
		}
	}

	async function fetchMultipleRates(query) {
		// e.g data = [{id: "USD_NGN", rate: 363}, {id: "GBP_NGN", rate: 420}]
		// const query = data.map(item => item.id).join();
		// {"USD_PHP":{"id":"USD_PHP","val":50.585039,"to":"PHP","fr":"USD"}}

		const convertEndpoint = `${
			config().converterApiUrl}/convert?q=${query}&apiKey=${
			config().converterApiKey}`;

		try {
			const response = await fetch(convertEndpoint);
			const data = await response.json();
			const rates = data.results;
			
			return rates;
		} catch (error) {
			throw new Error('There was a problem getting the rates: ', error.message);
		}
	}

	async function convertLastEdited() {
		await sourceEdited ? convertSource() : convertTarget();

		document.querySelector('#sourceCurrency').options[0].innerHTML = source;
		document.querySelector('#targetCurrency').options[0].innerHTML = target;
	}

	async function convertSource(amount, useCachedRate) {
		amount ? 
			convertCurrency(0, amount, useCachedRate) : 
			convertCurrency(0, sourceAmount, useCachedRate);
	}

	async function convertTarget(amount, useCachedRate) {
		amount ? 
			convertCurrency(1, amount, useCachedRate) : 
			convertCurrency(1, targetAmount, useCachedRate);
	}

	async function convertCurrency(mode, amount, useCachedRate) {
		const rate = useCachedRate ? exchangeRate : await fetchRate();

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

	async function fetchRate() {
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

	function handleFavorite() {
		const id = source + "_" + target;
		const query = favorites.find(item => (item.id === id));

		if (!query) {
			toggleSnackbar();

			const updatedFavorites = favorites.concat([{
				id: id,
				rate: exchangeRate.toFixed(2),
				to: target,
				from: source
			}]);

			setFavorites(updatedFavorites);
			window.localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
		}
	}

	function toggleSnackbar() {
		const snackbar = document.querySelector(".snackbar");

		snackbar.classList.add("snackbar--open");
		window.setTimeout(() => {
			snackbar.classList.remove("snackbar--open");
		}, 3000);
	}

	async function handleSwap() {
		setSource(target);
		setTarget(source);
		setSourceName(targetName);
		setTargetName(sourceName);
	}

	function handleTabSwitch(e) {
		const tab = parseInt(e.target.dataset.tab);
		setActiveTab(tab);
	}

	function handleAppReload() {
		window.localStorage.removeItem("currencies");
		window.localStorage.removeItem("lastConversion");
		window.location.reload();
	}

	return (
		<React.Fragment>
			<Header 
				handleAppReload={handleAppReload} 
				handleTabSwitch={handleTabSwitch}
				activeTab={activeTab}
			/>
			<main className="main">
				<article className={"tab " + (activeTab === 0 ? "tab--active" : "")}>
					<Converter
						currencies={currencies}
						source={source}
						sourceName={sourceName}
						handleSourceChange={handleSourceChange}
						sourceAmount={sourceAmount}
						handleSourceAmountChange={handleSourceAmountChange}
						target={target}
						targetName={targetName}
                        handleTargetChange={handleTargetChange}
                        targetAmount={targetAmount}
						handleTargetAmountChange={handleTargetAmountChange}
						exchangeRate={exchangeRate.toFixed(2)}
						handleSwap={handleSwap}
						handleFavorite={handleFavorite}
					/>
				</article>
				<article className={"tab fav-tab " + (activeTab === 1 ? "tab--active" : "")}>
					<Favorite favorites={favorites} />
				</article>
			</main>
			<article className="snackbar">
				<div className="snackbar__surface">
					<div className="snackbar__label"><span role="img" aria-label="Saved">👍</span> Saved to Favorites</div>
				</div>
			</article>
		</React.Fragment>
	);
}

export default App;