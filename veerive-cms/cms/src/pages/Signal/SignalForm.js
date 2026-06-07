// pages/Signal/SignalForm.js
import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import SignalContext from '../../context/SignalContext';
import styles from '../../html/css/Signal.module.css';

export default function SignalForm({ handleFormSubmit }) {
    const { signals, signalsDispatch, setIsFormVisible, isFormVisible } = useContext(SignalContext);

    const [signalName, setSignalName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (signals.editId) {
            const signal = signals.data.find((ele) => ele._id === signals.editId);
            setSignalName(signal.signalName);
        } else {
            setSignalName('');
        }
    }, [signals.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = { signalName };
        
        try {
            if (signals.editId) {
                const response = await axios.put(`/api/admin/signals/${signals.editId}`, formData, { 
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
                });
                signalsDispatch({ type: 'UPDATE_SIGNAL', payload: response.data });
                handleFormSubmit('Signal updated successfully');
            } else {
                const response = await axios.post('/api/admin/signals', formData, { 
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } 
                });
                signalsDispatch({ type: 'ADD_SIGNAL', payload: response.data });
                handleFormSubmit('Signal added successfully');
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
                    {signals.editId ? 'Edit Business Signal' : 'Add Business Signal'}
                </h1>
                <button 
                    type="button" 
                    className={styles.primaryButton} 
                    onClick={handleHomeNav}
                    disabled={isSubmitting}
                >
                    ← Back to Signals
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <h2 className={styles.formTitle}>
                    {signals.editId ? 'Edit Signal Details' : 'Create New Signal'}
                </h2>

                <div className={styles.formGroup}>
                    <label htmlFor="signalName" className={styles.formLabel}>
                        Signal Name <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input
                        type="text"
                        id="signalName"
                        placeholder="Enter signal name (e.g., Economic Growth, Market Expansion)"
                        name="signalName"
                        value={signalName}
                        onChange={(e) => setSignalName(e.target.value)}
                        className={styles.formInput}
                        required
                        disabled={isSubmitting}
                    />
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting 
                            ? (signals.editId ? 'Updating...' : 'Creating...') 
                            : (signals.editId ? 'Update Signal' : 'Create Signal')
                        }
                    </button>
                </div>
            </form>

            {isSubmitting && (
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
                        <div>Processing...</div>
                    </div>
                </div>
            )}
        </div>
    );
}
