
import { createContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const MasterDataContext = createContext({ masterData: {}, loading: true, error: null }); // ✅ Default value

export const MasterDataProvider = ({ children }) => {
    const [masterData, setMasterData] = useState({
        contexts: [],
        countries: [],
        companies: [],
        regions: [],
        themes: [],
        sectors: [],
        subSectors: [],
        signals: [],
        subSignals: [],
        sources: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ DISABLED - Only load master data when needed
    // useEffect(() => {
    //     const loadMasterData = async () => {
    //         try {
    //             const [contexts, countries, companies, regions, themes, sectors, subSectors, signals, subSignals, sources] = await Promise.all([
    //                 axios.get('/api/admin/contexts', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/countries', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/companies', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/regions', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/themes', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/sectors', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/sub-sectors', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/signals', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/sub-signals', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //                 axios.get('/api/admin/sources', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
    //             ]);

    //             setMasterData({
    //                 contexts: contexts.data,
    //                 countries: countries.data,
    //                 companies: companies.data,
    //                 regions: regions.data,
    //                 themes: themes.data,
    //                 sectors: sectors.data,
    //                 subSectors: subSectors.data,
    //                 signals: signals.data,
    //                 subSignals: subSignals.data,
    //                 sources: sources.data,
    //             });

    //             setLoading(false);
    //         } catch (error) {
    //             console.error('❌ Error loading master data:', error);
    //             setError("Failed to load master data");
    //             setLoading(false);
    //         }
    //     };

    //     loadMasterData();
    // }, []);

    return (
        <MasterDataContext.Provider value={{ masterData, loading, error }}>
            {children}
        </MasterDataContext.Provider>
    );
};

export default MasterDataContext;
