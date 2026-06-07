import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import { toast } from 'react-toastify';
import styles from '../../html/css/QueryRefiner.module.css';

export default function QueryRefinerForm() {
  const [title, setTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [promptGuidance, setPromptGuidance] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchQueryRefiner();
    }
  }, [id]);

  useEffect(() => {
  }, [sectors]);

  // Reset sub-sector when sector changes (only for new records)
  useEffect(() => {
    if (!isEditing) {
      setSubSector('');
    }
  }, [sector, isEditing]);

  const fetchQueryRefiner = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/query-refiner/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      
      const data = response.data;
      setTitle(data.title || '');
      setModuleDescription(data.moduleDescription || '');
      setPromptGuidance(data.promptGuidance || '');
      setSector(data.sector?._id || '');
      setSubSector(data.subSector?._id || '');
    } catch (error) {
      console.error('Error fetching query refiner:', error);
      toast.error('Failed to fetch query refiner data');
      navigate('/query-refiner');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        title,
        moduleDescription,
        promptGuidance,
        sector,
        ...(subSector && { subSector })
      };

      if (isEditing) {
        await axios.put(`/api/admin/query-refiner/${id}`, payload, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        toast.success('Query refiner updated successfully!');
      } else {
        await axios.post('/api/admin/query-refiner', payload, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        toast.success('Query refiner added successfully!');
      }
      
      navigate('/query-refiner');
    } catch (error) {
      console.error('Error saving query refiner:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} query refiner`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubSectors = subSectors?.data?.filter(ss => ss.sectorId === sector) || [];

  // Ensure the selected subSector is in the options when editing
  const subSectorOption = subSectors?.data?.find(ss => ss._id === subSector);
  const subSectorOptions = filteredSubSectors.slice();
  if (subSector && subSectorOption && !filteredSubSectors.some(ss => ss._id === subSector)) {
    subSectorOptions.push(subSectorOption);
  }

  // Check if sectors data exists and has items
  const sectorOptions = sectors?.data || [];
  return (
    <div className={styles.formContainer}>
      <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={() => navigate('/query-refiner')}>
        ← Back to Query Refiner
      </button>
      <div className={styles.companyFormContainer}>
        <h2>{isEditing ? 'Edit Query Refiner' : 'Add Query Refiner'}</h2>
        <form onSubmit={handleSubmit} className={styles.companyForm}>
          <div>
            <label>Title <span style={{color: 'red'}}>*</span></label>
            <input id="fieldnxucd" name="fieldnxucd" 
              className={styles.companyInput} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Enter title"
            />
          </div>
          
          <div>
            <label>Module Description <span style={{color: 'red'}}>*</span></label>
            <textarea id="fieldd4dc1" name="fieldd4dc1" 
              className={styles.companyTextarea} 
              value={moduleDescription} 
              onChange={e => setModuleDescription(e.target.value)} 
              required 
              placeholder="Enter module description"
            />
          </div>
          
          <div>
            <label>Prompt Guidance <span style={{color: 'red'}}>*</span></label>
            <textarea id="fieldehpgw" name="fieldehpgw" 
              className={styles.companyTextarea} 
              value={promptGuidance} 
              onChange={e => setPromptGuidance(e.target.value)} 
              required 
              placeholder="Enter prompt guidance"
            />
          </div>
          
          <div>
            <label>Sector <span style={{color: 'red'}}>*</span></label>
            <select id="fieldlqjbk" name="fieldlqjbk" 
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
              {subSectorOptions.map(ss => (
                <option key={ss._id} value={ss._id}>{ss.subSectorName}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              className={styles.companySubmitBtn} 
              type="submit"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Query Refiner' : 'Add Query Refiner')}
            </button>
            
            <button 
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/query-refiner')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 