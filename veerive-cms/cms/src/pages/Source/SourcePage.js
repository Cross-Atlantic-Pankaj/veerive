// pages/Region/RegionPage.js
import React, { useContext } from 'react';
import SourceList from './SourceList';
import SourceForm from './SourceForm';
import SourceContext from '../../context/SourceContext';
import styles from '../../html/css/Source.module.css';

const SourcePage = () => {
    const {  isFormVisible, handleFormSubmit } = useContext(SourceContext);

    return (
        <div className="source-page">
            {!isFormVisible ? (
                <SourceList />
            ) : (
                <SourceForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default SourcePage;
