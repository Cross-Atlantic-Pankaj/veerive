// pages/SubSignal/SubSignalPage.js
import React, { useContext } from 'react';
import SubSignalList from './SubSignalList';
import SubSignalForm from './SubSignalForm';
import SubSignalContext from '../../context/SubSignalContext';
import styles from '../../html/css/SubSignal.module.css';

export default function SubSignalPage() {
    const {  isFormVisible, handleAddClick, handleFormSubmit } = useContext(SubSignalContext);

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Business Sub-Signals</h1>
                {!isFormVisible && (
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Sub-Signal
                    </button>
                )}
            </div>
            {!isFormVisible ? (
                <SubSignalList />
            ) : (
                <SubSignalForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
