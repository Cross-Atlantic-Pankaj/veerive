import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import SourceContext from '../../context/SourceContext';
import { toast } from 'react-toastify';
import styles from '../../html/css/MarketData.module.css';

export default function MarketDataForm() {
  const [title, setTitle] = useState('');
  const [dataDescription, setDataDescription] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [csvUpload, setCsvUpload] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);
  const { sources } = useContext(SourceContext);

  useEffect(() => {
  }, [sectors]);

  // Fetch market data for edit mode
  const fetchMarketData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/market-data/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      
      const data = response.data;
      setTitle(data.title || '');
      setDataDescription(data.dataDescription || '');
      setSector(data.sector?._id || '');
      setSubSector(data.subSector?._id || '');
      setSourceName(data.sourceName || '');
      setCsvUpload(data.csvUpload || '');
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to fetch market data');
      navigate('/market-data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchMarketData();
    }
  }, [id, isEdit]);

  // Reset sub-sector when sector changes
  useEffect(() => {
    if (!isEdit) {
    setSubSector('');
    }
  }, [sector, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const requestData = {
        title,
        dataDescription,
        sector,
        subSector,
        sourceName,
        csvUpload
      };

      if (isEdit) {
        await axios.put(`/api/admin/market-data/${id}`, requestData, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        toast.success('Market data updated successfully!');
      } else {
        await axios.post('/api/admin/market-data', requestData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      toast.success('Market data added successfully!');
      }
      
      navigate('/market-data');
    } catch (error) {
      console.error('Error saving market data:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} market data`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/market-data');
  };

  const filteredSubSectors = subSectors?.data?.filter(ss => ss.sectorId === sector) || [];

  // Check if sectors data exists and has items
  const sectorOptions = sectors?.data || [];
  if (isEdit && loading) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={() => navigate('/market-data')}>
        ← Back to Market Data
      </button>
      <div className={styles.companyFormContainer}>
        <h2>{isEdit ? 'Edit' : 'Add'} Market Data</h2>
        <form onSubmit={handleSubmit} className={styles.companyForm}>
            <div>
              <label>Title <span style={{color: 'red'}}>*</span></label>
              <input id="fieldm4o46" name="fieldm4o46" 
              className={styles.companyInput} 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Enter title"
              />
            </div>
            
            <div>
              <label>Data Description <span style={{color: 'red'}}>*</span></label>
              <textarea id="fieldid94v" name="fieldid94v" 
              className={styles.companyTextarea} 
                value={dataDescription} 
                onChange={e => setDataDescription(e.target.value)} 
                required 
                placeholder="Enter data description"
              />
            </div>
            
            <div>
              <label>Sector <span style={{color: 'red'}}>*</span></label>
              <select id="fieldngf99" name="fieldngf99" 
              className={styles.companySelect} 
                value={sector} 
                onChange={e => setSector(e.target.value)} 
                required
              >
                <option value="">Select Sector</option>
                {sectorOptions.length > 0 ? (
                  sectorOptions.map(sec => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name || sec.sectorName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading sectors...</option>
                )}
              </select>
            </div>
            
            <div>
              <label htmlFor="subsector">Sub-Sector</label>
                    <select
                        id="subsector"
                        name="subsector" 
              className={styles.companySelect} 
                value={subSector} 
                onChange={e => setSubSector(e.target.value)} 
                disabled={!sector}
              >
                <option value="">Select Sub-Sector</option>
                {filteredSubSectors.map(ss => (
                  <option key={ss._id} value={ss._id}>{ss.name || ss.subSectorName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label>Source Name <span style={{color: 'red'}}>*</span></label>
              <select id="fieldv8x4x" name="fieldv8x4x"
              className={styles.companySelect}
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                required
              >
                <option value="">Select Source</option>
                {sources?.data?.map(src => (
                  <option key={src._id} value={src.sourceName}>{src.sourceName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="csvuploadurlorfilepath">CSV Upload (URL or file path)</label>
                    <input
                        id="csvuploadurlorfilepath"
                        name="csvuploadurlorfilepath" 
              className={styles.companyInput} 
                value={csvUpload} 
                onChange={e => setCsvUpload(e.target.value)} 
                placeholder="Enter CSV upload URL or file path (optional)"
              />
            </div>
            
          <div className={styles.buttonGroup}>
            <button 
              className={styles.companySubmitBtn} 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Market Data'}
            </button>
          </div>
          </form>
      </div>
    </div>
  );
} 