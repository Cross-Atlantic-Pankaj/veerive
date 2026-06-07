import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import styles from '../../html/css/Sector.module.css';

export default function SectorForm({ handleFormSubmit }) {
    const { sectors, sectorsDispatch, setIsFormVisible, isFormVisible } = useContext(SectorContext);
    const navigate = useNavigate();

    const [sectorName, setSectorName] = useState('');

    useEffect(() => {
        if (sectors.editId) {
            const sector = sectors.data.find((ele) => ele._id === sectors.editId);
            setSectorName(sector.sectorName);
        } else {
            setSectorName('');
        }
    }, [sectors.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            sectorName,
        };
        if (sectors.editId) {
            try {
                const response = await axios.put(`/api/admin/sectors/${sectors.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'UPDATE_SECTOR', payload: response.data });
                handleFormSubmit('Sector updated successfully');
            } catch (err) {
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sectors', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                sectorsDispatch({ type: 'ADD_SECTOR', payload: response.data });
                handleFormSubmit('Sector added successfully');
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
        navigate('/sectors');
    };

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleBackToList}>
                ← Back to Sectors
            </button>
            <div className={styles.companyFormContainer}>
                <h2>{sectors.editId ? 'Edit Sector' : 'Add Sector'}</h2>
                <form onSubmit={handleSubmit} className={styles.companyForm}>
                    <div>
                        <label htmlFor="sectorName">Sector Name <span style={{color: 'red'}}>*</span></label>
                        <input
                            id="sectorName"
                            name="sectorName"
                            type="text"
                            placeholder="Enter sector name"
                            value={sectorName}
                            onChange={(e) => setSectorName(e.target.value)}
                            className={styles.companyInput}
                            required
                        />
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.companySubmitBtn}>
                            {sectors.editId ? 'Update Sector' : 'Add Sector'}
                        </button>
                        <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
