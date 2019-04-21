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
      sortedCurrencies: null,
      source: "USD",
      target: "NGN",
      sourceAmount: 100,
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
    await this.getCurrencies();
    await this.convertSource();
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

        this.setState({ currencies: currencies });

        // Caches the list of currencies in local storage
        window.localStorage.setItem(
          "currencies",
          JSON.stringify(currencies)
        );
      } catch(error) {
        throw new Error(
          "There was a problem getting the currencies: ",
          error.message
        );
      }
    }
  }

  async getRate () {
    const convertEndpoint = `${
      this.config().converterApiUrl}/convert?q=${
      this.state.source}_${this.state.target}&compact=ultra&apiKey=${
      this.config().converterApiKey}`;

    try {
      const response = await fetch(convertEndpoint);
      const data = await response.json();
      const exchangeRate = Object.entries(data)[0][1]

      this.setState({
        exchangeRate: exchangeRate
      });

    } catch(error) {
      throw new Error('There was a problem getting the rates: ', error.message);
    }
  }

  async convertSource() {
    await this.getRate();

    this.setState({
      targetAmount: (this.state.sourceAmount * this.state.exchangeRate).toFixed(2)
    });
  }

  async convertTarget() {
    await this.getRate();

    this.setState({
      sourceAmount: (this.state.targetAmount / this.state.exchangeRate).toFixed(2)
    });
  }

  sortCurrencies(currencies) {
    const sortedCurrencies = Object.values(currencies).sort((a, b) => {
      if (a.id < b.id) { return -1 };
      if (a.id > b.id) { return 1 };

      return 0;
    });

    return sortedCurrencies;
  }

  handleSourceAmountChange(e) {
    this.setState({
      sourceAmount: e.target.value,
      targetAmount: (e.target.value * this.state.exchangeRate).toFixed(2),
      sourceEdited: true,
    });
  }

  handleTargetAmountChange(e) {
    this.setState({
      targetAmount: e.target.value,
      sourceAmount: (e.target.value / this.state.exchangeRate).toFixed(2),
      sourceEdited: false,
    });
  }

  handleSourceChange(e) {
    const currency = this.state.currencies.find(currency => (currency.id === e.target.value));
    const currencyName = currency.currencyName;

    this.setState({
      source: e.target.value,
      sourceName: currencyName,
    }, async () => {
      await this.state.sourceEdited ? this.convertSource() : this.convertTarget()
    });
  }

  handleTargetChange(e) {
    const currency = this.state.currencies.find(currency => (currency.id === e.target.value));
    const currencyName = currency.currencyName;

    this.setState({
      target: e.target.value,
      targetName: currencyName,
    }, async () => {
      await this.state.sourceEdited ? this.convertSource() : this.convertTarget()
    });
  }

  render() {
    return (
      <React.Fragment>
        <Header />
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