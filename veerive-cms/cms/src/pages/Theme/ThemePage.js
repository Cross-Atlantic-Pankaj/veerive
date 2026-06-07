import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemeContext';
import ThemeList from './ThemeList';
import ThemeForm from './ThemeForm';
import styles from '../../html/css/Theme.module.css';

const ThemePage = () => {
    const {  isFormVisible,  handleFormSubmit } = useContext(ThemeContext);

    return (
        <div className="themes-container">
            {/* <h2>Themes Master</h2> */}
            {!isFormVisible ? (
                <>
                    <ThemeList />
                </>
            ) : (
                <ThemeForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default ThemePage;
