import React, { useContext, useState, useEffect } from 'react'; // Importing necessary React hooks and components
import CompanyContext from '../../context/CompanyContext'; // Importing CompanyContext to use context state and actions
import axios from '../../config/axios'; // Importing axios instance for making HTTP requests
import styles from '../../html/css/Company.module.css'; // Importing CSS module for styling the component

export default function CompanyForm() {
    // Destructuring context values and functions from CompanyContext
    const { companies, companiesDispatch, handleFormSubmit, countries, sectors: sectorsData, subSectors: subSectorsData, setIsFormVisible, isFormVisible } = useContext(CompanyContext);

    // State hooks for managing form data and other states
    const [companyName, setCompanyName] = useState(''); // State for company name
    const [parentName, setParentName] = useState(''); // State for parent company name
    const [website, setWebsite] = useState(''); // State for company website
    const [country, setCountry] = useState(''); // State for selected country
    const [sector, setSector] = useState(''); // Changed from selectedSectors array to single sector
    const [subSector, setSubSector] = useState(''); // Changed from selectedSubSectors array to single subSector
    const [filteredSubSectors, setFilteredSubSectors] = useState([]); // State for filtered sub-sectors based on selected sectors

    useEffect(() => {
        // Effect runs when component mounts or dependencies change
        if (companies.editId) {
            // If there's an editId, find the company to edit
            const company = companies.data.find((ele) => ele._id === companies.editId);
            if (company) {
                // Populate form fields with company data
                setCompanyName(company.companyName);
                setParentName(company.parentName);
                setWebsite(company.website);
                setCountry(company.country);
                setSector(company.sectors?.[0] || ''); // Take first sector if exists
                setSubSector(company.subSectors?.[0] || ''); // Take first subSector if exists
    
                // Filter sub-sectors based on selected sector
                if (subSectorsData.data && company.sectors?.[0]) {
                    const filtered = subSectorsData.data.filter(subSector => 
                        subSector.sectorId === company.sectors[0]
                    );
                    setFilteredSubSectors(filtered);
                }
            }
        } else {
            // Clear fields if no editId (creating a new company)
            setCompanyName('');
            setParentName('');
            setWebsite('');
            setCountry('');
            setSector('');
            setSubSector('');
            setFilteredSubSectors([]);
        }
    }, [companies.editId, companies.data, subSectorsData.data]); // Dependencies for effect

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents default form submission
        // Creates a form data object to send to the server
        const formData = {
            companyName,
            parentName,
            website,
            country,
            sectors: sector ? [sector] : [], // Convert single sector to array
            subSectors: subSector ? [subSector] : [], // Convert single subSector to array
        };
    
        try {
            if (companies.editId) {
                // If editing an existing company, send a PUT request
                const response = await axios.put(`/api/admin/companies/${companies.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                companiesDispatch({ type: 'UPDATE_COMPANY', payload: response.data }); // Dispatch update action
                handleFormSubmit('Company updated successfully'); // Notify success
            } else {
                // If creating a new company, send a POST request
                const response = await axios.post('/api/admin/companies', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                console.log('adding comp', response); // Log response for debugging
                companiesDispatch({ type: 'ADD_COMPANY', payload: response.data }); // Dispatch add action
                handleFormSubmit('Company added successfully'); // Notify success
            }
        } catch (err) {
            console.error('Error submitting form:', err); // Log error
            alert('An error occurred while submitting the form.'); // Notify user of error
        }
    };

    const handleSectorChange = (e) => {
        const selectedSector = e.target.value;
        setSector(selectedSector);
        setSubSector(''); // Reset subsector when sector changes
    
        // Filter sub-sectors based on selected sector
        if (subSectorsData.data && selectedSector) {
            const filtered = subSectorsData.data.filter(subSector => 
                subSector.sectorId === selectedSector
            );
            setFilteredSubSectors(filtered);
        } else {
            setFilteredSubSectors([]);
        }
    };
    
    console.log('filtered subsec', filteredSubSectors); // Log filtered sub-sectors for debugging
    console.log('sele sub sec', subSector); // Log selected sub-sectors for debugging
    
    const handleBackToList = () => {
        setIsFormVisible(false);
    };

    const resetForm = () => {
        setCompanyName('');
        setParentName('');
        setWebsite('');
        setCountry('');
        setSector('');
        setSubSector('');
        setFilteredSubSectors([]);
    };

    return (
        <div className={styles.companyFormContainer}>
            <button 
                type="button" 
                className={styles.cancelBtn} 
                style={{ marginBottom: 20 }} 
                onClick={handleBackToList}
            >
                ← Back to Companies
            </button>
            <h2>{companies.editId ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div>
                    <label htmlFor="companyName">Company Name <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={styles.companyInput}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="parentName">Parent Name</label>
                    <input
                        id="parentName"
                        name="parentName"
                        type="text"
                        placeholder="Parent Name"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className={styles.companyInput}
                    />
                </div>
                <div>
                    <label htmlFor="website">Company Website <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="Company Website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className={styles.companyInput}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="country">Country <span style={{color: 'red'}}>*</span></label>
                    <select
                        id="country"
                        name="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={styles.companySelect}
                        required
                    >
                        <option value="">Select Country</option>
                        {countries.data && countries.data.map(country => (
                            <option key={country._id} value={country._id}>{country.countryName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sector">Sectors <span style={{color: 'red'}}>*</span></label>
                    <select
                        id="sector"
                        name="sector"
                        value={sector}
                        onChange={handleSectorChange}
                        className={styles.companySelect}
                        required
                    >
                        <option value="">Select Sector</option>
                        {sectorsData.data && sectorsData.data.map(sector => (
                            <option key={sector._id} value={sector._id}>{sector.sectorName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="subSector">Sub-Sectors</label>
                    <select
                        id="subSector"
                        name="subSector"
                        value={subSector}
                        onChange={(e) => setSubSector(e.target.value)}
                        className={styles.companySelect}
                        disabled={!sector}
                    >
                        <option value="">Select Sub-Sector</option>
                        {filteredSubSectors.map(subSector => (
                            <option key={subSector._id} value={subSector._id}>{subSector.subSectorName}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {companies.editId ? 'Update Company' : 'Add Company'}
                    </button>
                    <button type="button" onClick={() => setIsFormVisible(false)} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
