import React, { useContext, useState, useEffect } from 'react';
import DriverContext from '../../context/DriverContext';
import ImageContext from '../../context/ImageContext';
import styles from '../../html/css/Theme.module.css';
import Select from 'react-select';

const DriverForm = ({ handleFormSubmit }) => {
    const { drivers, setIsFormVisible } = useContext(DriverContext);
    const { images, fetchAllImages } = useContext(ImageContext);
    const [formData, setFormData] = useState({
        driverName: '',
        driverDescription: '',
        icon: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch images when component mounts
    useEffect(() => {
        fetchAllImages();
    }, [fetchAllImages]);

    useEffect(() => {
        if (drivers.editId) {
            // Find the driver to edit
            const driverToEdit = drivers.allDrivers?.find(d => d._id === drivers.editId);
            if (driverToEdit) {
                setFormData({
                    driverName: driverToEdit.driverName || '',
                    driverDescription: driverToEdit.driverDescription || '',
                    icon: driverToEdit.icon || ''
                });
            }
        } else {
            // Reset form for new driver
            setFormData({
                driverName: '',
                driverDescription: '',
                icon: ''
            });
        }
    }, [drivers.editId, drivers.allDrivers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await handleFormSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save driver');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsFormVisible(false);
    };

    return (
        <div className={styles.contentContainer}>
            <div className={styles.pageHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>
                    {drivers.editId ? 'Edit Driver' : 'Add New Driver'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div className="form-group">
                    <label><b>Driver Name</b> <span style={{color:'red'}}>*</span></label>
                    <input 
                        type="text" 
                        className="theme-input" 
                        name="driverName"
                        value={formData.driverName} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label><b>Description</b></label>
                    <textarea 
                        className="theme-input" 
                        name="driverDescription"
                        value={formData.driverDescription} 
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter driver description..."
                    />
                </div>

                <div className="form-group">
                    <label><b>Icon</b></label>
                    <Select
                        value={formData.icon ? { value: formData.icon, label: (images.allImages?.find(img => img.imageLink === formData.icon)?.imageTitle) || 'Selected Image' } : null}
                        onChange={(option) => setFormData(prev => ({ ...prev, icon: option ? option.value : '' }))}
                        options={(images.allImages || []).map(img => ({ 
                            value: img.imageLink, 
                            label: img.imageTitle 
                        }))}
                        formatOptionLabel={({ label, value }) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img 
                                    src={value} 
                                    alt={label} 
                                    style={{ 
                                        width: 30, 
                                        height: 30, 
                                        objectFit: 'contain',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }} 
                                />
                                <span>{label}</span>
                            </div>
                        )}
                        isClearable
                        placeholder="Select an icon from the image library..."
                        className="theme-select"
                        noOptionsMessage={() => "No images available. Please add images to the image library first."}
                    />
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

                <div className={styles.buttonGroup}>
                    <button 
                        type="submit" 
                        className={styles.companySubmitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (drivers.editId ? 'Update Driver' : 'Save Driver')}
                    </button>
                    <button 
                        type="button" 
                        className={styles.companyCancelBtn}
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DriverForm;
