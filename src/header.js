import React from 'react';
import logo from "./img/logo.svg";

const Header = (props) => {
  return (
    <header className="header">
      <div className="logo" onClick={props.handleAppReload}>
        <img src={logo} alt="logo" width="80" height="30" />
      </div>
      <button className="swap" onClick={props.handleSwap} title="Swap currencies" role="presentation"></button>
    </header>
  );
};

export default Header;