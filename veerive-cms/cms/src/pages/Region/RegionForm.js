import { useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';
import RegionContext from '../../context/RegionContext';
import ImageContext from '../../context/ImageContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select';
import styles from '../../html/css/Theme.module.css';

export default function RegionForm() {
    const { regions, regionsDispatch, handleFormSubmit, setIsFormVisible } = useContext(RegionContext);
    const { images, fetchAllImages } = useContext(ImageContext);

    const [regionName, setRegionName] = useState('');
    const [regionIcon, setRegionIcon] = useState('');
    const [regionDescription, setRegionDescription] = useState('');

    useEffect(() => {
        if (regions.editId) {
            const region = regions.data.find((ele) => ele._id === regions.editId);
            setRegionName(region.regionName || '');
            setRegionIcon(region.regionIcon || '');
            setRegionDescription(region.regionDescription || '');
        } else {
            setRegionName('');
            setRegionIcon('');
            setRegionDescription('');
        }
    }, [regions.editId, regions.data]);

    // Ensure images are loaded for the icon dropdown
    useEffect(() => {
        fetchAllImages && fetchAllImages();
        // we intentionally don't add images to deps to avoid refetch loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAllImages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            regionName,
            regionIcon,
            regionDescription,
        };
        if (regions.editId) {
            try {
                const response = await axios.put(`/api/admin/regions/${regions.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                regionsDispatch({ type: 'UPDATE_REGION', payload: response.data });
                handleFormSubmit('Region updated successfully');
            } catch (err) {
            }
        } else {
            try {
                const response = await axios.post('/api/admin/regions', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                regionsDispatch({ type: 'ADD_REGION', payload: response.data });
                handleFormSubmit('Region added successfully');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleHomeNav = () =>{
        setIsFormVisible(false)
    }

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleHomeNav}>
                ← Back to Regions
            </button>
            <h2>{regions.editId ? 'Edit Region' : 'Add Region'}</h2>

            <form onSubmit={handleSubmit} className={styles.companyForm}>
                {/* Region Name */}
                <div className="form-group">
                    <label htmlFor="regionName"><b>Region Name</b> <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="regionName"
                        type="text"
                        placeholder="Enter region name"
                        name="regionName"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        className="theme-input"
                        required
                    />
                </div>

                {/* Region Icon */}
                <div className="form-group">
                    <label><b>Region Icon</b></label>
                    <Select
                        value={regionIcon ? { value: regionIcon, label: (images.allImages?.find(img => img.imageLink === regionIcon)?.imageTitle) || 'Selected Image' } : null}
                        onChange={(option) => setRegionIcon(option ? option.value : '')}
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
                    />
                </div>

                {/* Region Description */}
                <div className="form-group">
                    <label htmlFor="regionDescription"><b>Region Description</b></label>
                    <ReactQuill
                        id="regionDescription"
                        value={regionDescription}
                        onChange={setRegionDescription}
                        className="theme-quill-editor"
                        placeholder="Enter region description..."
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                </div>

                {/* General Comment */}
                

                {/* Submit Button */}
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {regions.editId ? 'Update Region' : 'Add Region'}
                    </button>
                    <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
