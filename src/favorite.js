import React from 'react';

const Favorite = props => {
    return (
        <React.Fragment>
            {
                Object.values(props.favorites).map(favorite => (
                    <div className="card" key={favorite.id}>
                        <div className="converter">
                            <div className="converter__form">
                                <div className="converter__input">
                                    <label className="converter__label">From</label>
                                    <div className="converter__input--number">1</div>
                                    <button 
                                        className="unfav-btn"
                                        onClick={props.handleUnfavorite}
                                        data-id={favorite.id}
                                        title="Swap currencies" 
                                        role="presentation">
                                    </button>
                                </div>
                                <div className="converter__currency converter__currency--fav">
                                    <img id="fromFlag" className="converter__flag" 
                                        src={`https://www.countryflags.io/${favorite.from.substring(0, 2)}/flat/32.png`} alt="flag" />
                                    <div className="converter__input-currency">{favorite.from}</div>
                                </div>
                            </div>
                            <div className="converter__form">
                                <div className="converter__input converter__input-last">
                                    <label className="converter__label">To</label>
                                    <div className="converter__input--number">{favorite.rate}</div>
                                </div>
                                <div className="converter__currency converter__currency--last converter__currency--fav">
                                    <img id="fromFlag" className="converter__flag" 
                                        src={`https://www.countryflags.io/${favorite.to.substring(0, 2)}/flat/32.png`} alt="flag" />
                                    <div className="converter__input-currency">{favorite.to}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </React.Fragment>
    );
}

export default Favorite;