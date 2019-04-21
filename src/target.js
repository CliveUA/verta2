import React from 'react';
import arrowDown from './img/arrow-down.svg';

const Target = props => {
  return (
    <div className="converter__form">
      <div className="converter__input converter__input--last">
        <label className="converter__label" htmlFor="targetInput">From</label>
        <input
          className="converter__input--number"
          type="number" name="targetInput" id="targetInput"
          value={props.targetAmount} placeholder="0" step="0.01"
          onChange={props.handleTargetAmountChange} autoFocus
        />
      </div>
      <div className="converter__currency converter__currency--last">
        <img id="fromFlag" className="converter__flag" src={`https://www.countryflags.io/${props.target.substring(0, 2)}/flat/24.png`} alt="flag" />
        <select className="converter__input-currency" name="targeturrency"
          id="targetCurrency" value={props.target} onChange={props.handleTargetChange}>
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

export default Target;