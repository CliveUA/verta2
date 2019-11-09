import React from 'react';
import logo from "./img/logo.svg";

const Header = (props) => {
    return (
        <header className="header">
            <div className="logo" onClick={props.handleAppReload}>
                <img src={logo} alt="logo" width="80" height="30" />
            </div>
            <nav className="menu">
                <ul>
                    <li>
                        <button
                            className={"menu__item " + (props.activeTab === 0 ? "menu__item--active" : "")}
                            onClick={props.handleTabSwitch}
                            data-tab="0">Converter</button>
                    </li>
                    <li>
                        <button
                            className={"menu__item " + (props.activeTab === 1 ? "menu__item--active" : "")}
                            onClick={props.handleTabSwitch}
                            data-tab="1">Favorites</button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;