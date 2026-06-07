import React, { useContext, useState, useEffect } from 'react';
import SourceContext from '../../context/SourceContext';
import axios from '../../config/axios';
import styles from '../../html/css/Source.module.css';

export default function SourceForm() {
    const { sources, sourcesDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(SourceContext);
 
    const [sourceName, setSourceName] = useState('');
    const [sourceType, setSourceType] = useState('');

    useEffect(() => {
        if (sources.editId) {
            const source = sources.data.find((ele) => ele._id === sources.editId);
            setSourceName(source.sourceName);
            setSourceType(source.sourceType);
        } else {
            setSourceName('');
            setSourceType('');
        }
    }, [sources.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            sourceName,
            sourceType,
        };
        if (sources.editId) {
            try {
                const response = await axios.put(`/api/admin/sources/${sources.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'UPDATE_SOURCE', payload: response.data });
                handleFormSubmit('Source updated successfully');
            } catch (err) {
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sources', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                sourcesDispatch({ type: 'ADD_SOURCE', payload: response.data });
                handleFormSubmit('Source added successfully');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
    };

    const handleBackToList = () => {
        setIsFormVisible(false);
    };

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleBackToList}>
                ← Back to Sources
            </button>
            <h2>{sources.editId ? 'Edit Source' : 'Add Source'}</h2>
            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div>
                    <label>Source Name <span style={{color: 'red'}}>*</span></label>
                    <input id="fieldpinm9" name="fieldpinm9"
                        type="text"
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                        placeholder="Source Name"
                        className={styles.companyInput}
                        required
                    />
                </div>
                
                <div>
                    <label>Source Type <span style={{color: 'red'}}>*</span></label>
                    <select id="field2zf49" name="field2zf49"
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className={styles.companySelect}
                        required
                    >
                        <option value="">Select Source Type</option>
                        <option value="News Site">News Site</option>
                        <option value="Social Media Post">Social Media Post</option>
                        <option value="Professional Services Firm">Professional Services Firm</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {sources.editId ? 'Update Source' : 'Add Source'}
                    </button>
                    <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
