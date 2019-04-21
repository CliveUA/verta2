import React from 'react';

const ExchangeRate = props => {
  return (
    <div className="exchange-rate">
      <strong>1 </strong>
      <span id="fromCurrencyName">{props.sourceName} = </span>
      <strong id="exchangeRate">{props.exchangeRate} </strong>
      <span id="toCurrencyName">{props.targetName}</span>
    </div>
  );
};

export default ExchangeRate;