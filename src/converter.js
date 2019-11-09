import React from 'react';
import Source from "./source";
import Target from "./target";
import ExchangeRate from "./exchangeRate";

const Converter = props => {
    return (
        <React.Fragment>
            <div className="card">
                <div className="converter">
                    <Source
                        currencies={props.currencies}
                        source={props.source}
                        handleSourceChange={props.handleSourceChange}
                        sourceAmount={props.sourceAmount}
                        handleSourceAmountChange={props.handleSourceAmountChange}
                        handleSwap={props.handleSwap}
                    />
                    <Target
                        currencies={props.currencies}
                        target={props.target}
                        handleTargetChange={props.handleTargetChange}
                        targetAmount={props.targetAmount}
                        handleTargetAmountChange={props.handleTargetAmountChange}
                    />
                </div>
            </div>
            <ExchangeRate
                sourceName={props.sourceName}
                targetName={props.targetName}
                exchangeRate={props.exchangeRate}
            />
            <button className="fav-btn" onClick={props.handleFavorite}></button>
        </React.Fragment>
    );
}

export default Converter;