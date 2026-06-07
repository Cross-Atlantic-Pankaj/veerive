import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import SubSectorContext from '../../context/SubSectorContext';
import SectorContext from '../../context/SectorContext';
import styles from '../../html/css/SubSector.module.css';

export default function SubSectorForm({ handleFormSubmit }) {
    const { subSectors, subSectorsDispatch, setIsFormVisible, isFormVisible } = useContext(SubSectorContext);
    const { sectors } = useContext(SectorContext);
    const navigate = useNavigate();

    const [subSectorName, setSubSectorName] = useState('');
    const [sectorId, setSectorId] = useState('');

    useEffect(() => {
        if (subSectors.editId) {
            const subSector = subSectors.data.find((ele) => ele._id === subSectors.editId);
            setSubSectorName(subSector.subSectorName);
            setSectorId(subSector.sectorId);
        } else {
            setSubSectorName('');
            setSectorId('');
        }
    }, [subSectors.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            subSectorName,
            sectorId,
        };
        if (subSectors.editId) {
            try {
                const response = await axios.put(`/api/admin/sub-sectors/${subSectors.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                subSectorsDispatch({ type: 'UPDATE_SUB_SECTOR', payload: response.data });
                handleFormSubmit('Sub-Sector updated successfully');
            } catch (err) {
            }
        } else {
            try {
                const response = await axios.post('/api/admin/sub-sectors', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                subSectorsDispatch({ type: 'ADD_SUB_SECTOR', payload: response.data });
                handleFormSubmit('Sub-Sector added successfully');
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
        navigate('/sub-sectors');
    };

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleBackToList}>
                ← Back to Sub-Sectors
            </button>
            <h2>{subSectors.editId ? 'Edit Sub-Sector' : 'Add Sub-Sector'}</h2>
            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div>
                    <label>Sub-Sector Name <span style={{color: 'red'}}>*</span></label>
                    <input id="entersubsectorname" name="entersubsectorname"
                        type="text"
                        placeholder="Enter sub-sector name"
                        value={subSectorName}
                        onChange={(e) => setSubSectorName(e.target.value)}
                        className={styles.companyInput}
                        required
                    />
                </div>
                
                <div>
                    <label>Sector <span style={{color: 'red'}}>*</span></label>
                    <select id="fieldjvra6" name="fieldjvra6"
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value)}
                        className={styles.companySelect}
                        required
                    >
                        <option value="">Select Sector</option>
                        {sectors.data.map((sector) => (
                            <option key={sector._id} value={sector._id}>
                                {sector.sectorName}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {subSectors.editId ? 'Update Sub-Sector' : 'Add Sub-Sector'}
                    </button>
                    <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
