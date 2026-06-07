import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../config/axios';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import { toast } from 'react-toastify';
import styles from '../../html/css/ClarificationGuidance.module.css';

export default function ClarificationGuidanceForm() {
  const [title, setTitle] = useState('');
  const [clarificationNote, setClarificationNote] = useState('');
  const [sector, setSector] = useState('');
  const [subSector, setSubSector] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { sectors } = useContext(SectorContext);
  const { subSectors } = useContext(SubSectorContext);

  useEffect(() => {
  }, [sectors]);

  // Fetch guidance data for edit mode
  const fetchClarificationGuidance = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/clarification-guidance/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      
      const guidance = response.data;
      setTitle(guidance.title || '');
      setClarificationNote(guidance.clarificationNote || '');
      setSector(guidance.sector?._id || '');
      setSubSector(guidance.subSector?._id || '');
    } catch (error) {
      console.error('Error fetching clarification guidance:', error);
      toast.error('Failed to fetch clarification guidance');
      navigate('/clarification-guidance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchClarificationGuidance();
    }
  }, [id, isEdit]);

  // Ensure sub-sector is set when data is loaded in edit mode
  useEffect(() => {
    if (isEdit && subSectors?.data?.length > 0 && subSector) {
      const subSectorExists = subSectors.data.find(ss => ss._id === subSector);
      if (!subSectorExists) {
        setSubSector('');
      }
    }
  }, [subSectors?.data, isEdit, subSector]);

  // Reset sub-sector when sector changes (only for new records)
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
        clarificationNote,
        sector,
        ...(subSector && { subSector })
      };

      if (isEdit) {
        await axios.put(`/api/admin/clarification-guidance/${id}`, requestData, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        toast.success('Clarification guidance updated successfully!');
      } else {
        await axios.post('/api/admin/clarification-guidance', requestData, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        toast.success('Clarification guidance added successfully!');
      }
      
      navigate('/clarification-guidance');
    } catch (error) {
      console.error('Error saving clarification guidance:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} clarification guidance`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clarification-guidance');
  };

  const filteredSubSectors = subSectors?.data?.filter(ss => ss.sectorId === sector) || [];

  // Ensure the selected subSector is in the options when editing
  const subSectorOption = subSectors?.data?.find(ss => ss._id === subSector);
  const subSectorOptions = filteredSubSectors.slice();
  if (subSector && subSectorOption && !filteredSubSectors.some(ss => ss._id === subSector)) {
    subSectorOptions.push(subSectorOption);
  }

  // Debug logging
  // Check if sectors data exists and has items
  const sectorOptions = sectors?.data || [];
  if (isEdit && loading) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading clarification guidance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={() => navigate('/clarification-guidance')}>
        ← Back to Clarification Guidance
      </button>
      <div className={styles.companyFormContainer}>
        <h2>{isEdit ? 'Edit' : 'Add'} Clarification Guidance</h2>
        <form onSubmit={handleSubmit} className={styles.companyForm}>
          <div>
            <label>Title <span style={{color: 'red'}}>*</span></label>
            <input id="fieldrvkx6" name="fieldrvkx6" 
              className={styles.companyInput}
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Enter title"
            />
          </div>
          
          <div>
            <label>Clarification Note <span style={{color: 'red'}}>*</span></label>
            <textarea id="fieldcuvx3" name="fieldcuvx3" 
              className={styles.companyTextarea}
              value={clarificationNote} 
              onChange={e => setClarificationNote(e.target.value)} 
              required 
              placeholder="Enter clarification note"
            />
          </div>
          
          <div>
            <label>Sector <span style={{color: 'red'}}>*</span></label>
            <select id="field9mjw4" name="field9mjw4" 
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
              {loading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update' : 'Add')} Clarification Guidance
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 