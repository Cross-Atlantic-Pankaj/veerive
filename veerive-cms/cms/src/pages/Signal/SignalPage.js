// pages/Signal/SignalPage.js
import React, { useContext } from 'react';
import SignalList from './SignalList';
import SignalForm from './SignalForm';
import SignalContext from '../../context/SignalContext';
import styles from '../../html/css/Signal.module.css';

export default function SignalPage() {
    const {  isFormVisible, handleAddClick, handleFormSubmit } = useContext(SignalContext);

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Business Signals</h1>
                {!isFormVisible && (
                    <button className={styles.primaryButton} onClick={handleAddClick}>
                        + Add New Signal
                    </button>
                )}
            </div>
            {!isFormVisible ? (
                <SignalList />
            ) : (
                <SignalForm handleFormSubmit={handleFormSubmit} />
            )}
        </div>
    );
}
