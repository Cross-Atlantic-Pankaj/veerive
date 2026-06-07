import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import CountryContext from '../../context/CountryContext';
import RegionContext from '../../context/RegionContext';
import { toast } from 'react-toastify';
import styles from '../../html/css/Country.module.css';

export default function CountryForm() {
    const { countries, countriesDispatch, handleFormSubmit, setIsFormVisible, isFormVisible } = useContext(CountryContext);
    const { regions } = useContext(RegionContext);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [countryName, setCountryName] = useState('');
    const [regionId, setRegionId] = useState('');

    // Fetch country data when editId changes
    useEffect(() => {
        const fetchCountryData = async () => {
            if (!countries.editId) {
                // Clear form if not in edit mode
                setCountryName('');
                setRegionId('');
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/admin/countries/${countries.editId}`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                
                if (response.data.success) {
                    const country = response.data.country;
                    setCountryName(country.countryName || '');
                    setRegionId(country.regionId || '');
                }
            } catch (err) {
                console.error('Error fetching country:', err);
                toast.error('Failed to load country data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountryData();
    }, [countries.editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = {
            countryName,
            regionId,
        };

        try {
            if (countries.editId) {
                const response = await axios.put(
                    `/api/admin/countries/${countries.editId}`, 
                    formData, 
                    { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
                );
                countriesDispatch({ type: 'UPDATE_COUNTRY', payload: response.data });
                toast.success('Country updated successfully');
            } else {
                const response = await axios.post(
                    '/api/admin/countries', 
                    formData, 
                    { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
                );
                countriesDispatch({ type: 'ADD_COUNTRY', payload: response.data });
                toast.success('Country added successfully');
            }
            handleFormSubmit('Operation completed successfully');
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error(err.response?.data?.error || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
    };

    const handleBackToList = () => {
        setIsFormVisible(false);
        navigate('/countries');
    };

    if (isLoading) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleBackToList}>
                ← Back to Countries
            </button>
            <h2>{countries.editId ? 'Edit Country' : 'Add Country'}</h2>
            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div>
                    <label htmlFor="countryName">Country Name <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="countryName"
                        name="countryName"
                        type="text"
                        placeholder="Enter country name"
                        value={countryName}
                        onChange={(e) => setCountryName(e.target.value)}
                        className={styles.companyInput}
                        disabled={isLoading}
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="regionId">Region <span style={{color: 'red'}}>*</span></label>
                    <select
                        id="regionId"
                        name="regionId"
                        value={regionId}
                        onChange={(e) => setRegionId(e.target.value)}
                        className={styles.companySelect}
                        disabled={isLoading}
                        required
                    >
                        <option value="">Select Region</option>
                        {regions.data?.map(region => (
                            <option key={region._id} value={region._id}>
                                {region.regionName}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className={styles.buttonGroup}>
                    <button 
                        type="submit" 
                        className={styles.companySubmitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (countries.editId ? 'Update Country' : 'Add Country')}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleHomeNav} 
                        className={styles.cancelBtn}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
