import React from 'react';
import logo from "./img/logo.svg";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="logo" width="80" height="30" />
      </div>
    </header>
  );
};

export default Header;