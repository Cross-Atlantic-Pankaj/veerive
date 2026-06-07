import React, { useContext } from 'react';
import SectorList from './SectorList';
import SectorForm from './SectorForm';
import SectorContext from '../../context/SectorContext';
import styles from '../../html/css/Sector.module.css';

export default function SectorPage() {
    const {  isFormVisible, handleFormSubmit } = useContext(SectorContext);

    return (
        <div className="sectors-container">
            {!isFormVisible ? (
                <SectorList />
            ) : (
                <SectorForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
