// pages/SubSignal/SubSignalForm.js
import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SubSignalContext from '../../context/SubSignalContext';
import styles from '../../html/css/SubSignal.module.css';

export default function SubSignalForm({ handleFormSubmit }) {
    const { subSignals, subSignalsDispatch, handleAddClick, setIsFormVisible, isFormVisible } = useContext(SubSignalContext);

    const [subSignalName, setSubSignalName] = useState('');
    const [signalId, setSignalId] = useState('');
    const [signals, setSignals] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSignals, setIsLoadingSignals] = useState(true);

    useEffect(() => {
        if (subSignals.editId) {
            const subSignal = subSignals.data.find((ele) => ele._id === subSignals.editId);
            setSubSignalName(subSignal.subSignalName);
            setSignalId(subSignal.signalId);
        } else {
            setSubSignalName('');
            setSignalId('');
        }
    }, [subSignals.editId]);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingSignals(true);
                const response = await axios.get('/api/admin/signals', { 
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
                });
                setSignals(response.data);
            } catch (err) {
                console.error('Error fetching signals:', err);
                alert('Error loading signals');
            } finally {
                setIsLoadingSignals(false);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = { subSignalName, signalId };
        
        try {
            if (subSignals.editId) {
                const response = await axios.put(`/api/admin/sub-signals/${subSignals.editId}`, formData, { 
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
                });
                subSignalsDispatch({ type: 'UPDATE_SUBSIGNAL', payload: response.data });
                handleFormSubmit('Sub-Signal updated successfully');
            } else {
                const response = await axios.post('/api/admin/sub-signals', formData, { 
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
                });
                subSignalsDispatch({ type: 'ADD_SUBSIGNAL', payload: response.data });
                handleFormSubmit('Sub-Signal added successfully');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHomeNav = () =>{
        setIsFormVisible(false)
    }

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    {subSignals.editId ? 'Edit Business Sub-Signal' : 'Add Business Sub-Signal'}
                </h1>
                <button 
                    type="button" 
                    className={styles.primaryButton} 
                    onClick={handleHomeNav}
                    disabled={isSubmitting}
                >
                    ← Back to Sub-Signals
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <h2 className={styles.formTitle}>
                    {subSignals.editId ? 'Edit Sub-Signal Details' : 'Create New Sub-Signal'}
                </h2>

                <div className={styles.formGroup}>
                    <label htmlFor="subSignalName" className={styles.formLabel}>
                        Sub-Signal Name <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input
                        type="text"
                        id="subSignalName"
                        placeholder="Enter sub-signal name (e.g., Interest Rate Changes, Competitor Analysis)"
                        name="subSignalName"
                        value={subSignalName}
                        onChange={(e) => setSubSignalName(e.target.value)}
                        className={styles.formInput}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="signalId" className={styles.formLabel}>
                        Parent Signal <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select
                        id="signalId"
                        name="signalId"
                        value={signalId}
                        onChange={(e) => setSignalId(e.target.value)}
                        className={styles.formSelect}
                        required
                        disabled={isSubmitting || isLoadingSignals}
                    >
                        <option value="">
                            {isLoadingSignals ? 'Loading signals...' : 'Select a parent signal'}
                        </option>
                        {signals.map((signal) => (
                            <option key={signal._id} value={signal._id}>
                                {signal.signalName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formActions}>
                    <button 
                        type="button" 
                        className={styles.cancelButton}
                        onClick={handleHomeNav}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={isSubmitting || isLoadingSignals || !signalId}
                    >
                        {isSubmitting 
                            ? (subSignals.editId ? 'Updating...' : 'Creating...') 
                            : (subSignals.editId ? 'Update Sub-Signal' : 'Create Sub-Signal')
                        }
                    </button>
                </div>
            </form>

            {(isSubmitting || isLoadingSignals) && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        textAlign: 'center' 
                    }}>
                        <div>
                            {isLoadingSignals ? 'Loading signals...' : 'Processing...'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
