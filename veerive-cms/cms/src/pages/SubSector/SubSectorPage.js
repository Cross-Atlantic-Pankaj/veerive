import React, { useContext } from 'react';
import SubSectorList from './SubSectorList';
import SubSectorForm from './SubSectorForm';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';
import styles from '../../html/css/SubSector.module.css';

export default function SubSectorPage() {
    const {  isFormVisible, handleFormSubmit } = useContext(SubSectorContext);
    const { sectors } = useContext(SectorContext);

    return (
        <div className="sub-sectors-container">
            {!isFormVisible ? (
                <SubSectorList />
            ) : (
                <SubSectorForm sectors={sectors} handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
