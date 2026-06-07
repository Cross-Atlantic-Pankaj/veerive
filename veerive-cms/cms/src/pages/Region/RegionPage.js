import React, { useContext } from 'react';
import RegionList from './RegionList';
import RegionForm from './RegionForm';
import RegionContext from '../../context/RegionContext';
import '../../html/css/Region.css';

const RegionPage = () => {
    const { isFormVisible, handleAddClick, handleFormSubmit } = useContext(RegionContext);

    return (
        <div className="regions-container">
            <h2>Regions Master</h2>
            {!isFormVisible ? (
                <>
                    <button className="add-region-btn" onClick={handleAddClick}>Add Region</button>
                    <RegionList />
                </>
            ) : (
                <RegionForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
};

export default RegionPage;
