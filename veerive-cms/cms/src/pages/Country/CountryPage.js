// pages/Country/CountryPage.js
import React, { useContext } from 'react';
import CountryList from './CountryList';
import CountryForm from './CountryForm';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import styles from '../../html/css/Country.module.css';

const CountryPage = () => {
    const { isFormVisible, handleFormSubmit } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);
    return (
        <div className="countries-container">
            {!isFormVisible ? (
                <CountryList />
            ) : (
                <CountryForm regions={regions} handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default CountryPage;
