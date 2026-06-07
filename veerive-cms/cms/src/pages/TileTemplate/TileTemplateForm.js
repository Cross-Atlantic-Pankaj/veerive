import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TileTemplateContext from '../../context/TileTemplateContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';
import styles from '../../html/css/TileTemplate.module.css';

const TileTemplateForm = ({ onClose }) => {
    const { id } = useParams();
    const { tileTemplates, loading, addTileTemplate, updateTileTemplate, fetchTileTemplates } = useContext(TileTemplateContext);
    
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#007bff');
    const [previewBackgroundColor, setPreviewBackgroundColor] = useState('#f8f9fa');
    const [iconName, setIconName] = useState('LineChart');
    const [iconColor, setIconColor] = useState('#ffffff');
    const [iconSize, setIconSize] = useState(32);
    const [jsxCode, setJsxCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // If editing and templates are not yet loaded (e.g., opened in a new window), fetch them
        if (id && tileTemplates.length === 0 && typeof fetchTileTemplates === 'function') {
            fetchTileTemplates();
        }
    }, [id, tileTemplates.length, fetchTileTemplates]);

    useEffect(() => {
        if (id) {
            const template = tileTemplates.find(t => t._id === id);
            if (template) {
                setName(template.name);
                setType(template.type);
                setBackgroundColor(template.backgroundColor || '#007bff');
                setPreviewBackgroundColor(template.previewBackgroundColor || '#f8f9fa');
                setIconName(template.iconName || 'LineChart');
                setIconColor(template.iconColor || '#ffffff');
                setIconSize(template.iconSize || 32);
            }
        }
    }, [id, tileTemplates]);

    useEffect(() => {
        // Auto-generate the JSX code whenever a property changes
        const generatedJsx = `<Tile bg="${backgroundColor}" icon="${iconName}" color="${iconColor}" size={${iconSize}} />`;
        setJsxCode(generatedJsx);
    }, [backgroundColor, iconName, iconColor, iconSize]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const templateData = { 
            name, 
            type, 
            jsxCode, 
            backgroundColor, 
            previewBackgroundColor,
            iconName, 
            iconColor, 
            iconSize 
        };
        try {
            if (id) {
                await updateTileTemplate(id, templateData);
            } else {
                await addTileTemplate(templateData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save tile template', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formWrapper}>
            {(loading || isSubmitting) && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px'
                }}>
                    <LoadingSpinner />
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>{id ? 'Edit' : 'Add'} Tile Template</h3>
                    <span 
                        className={styles.closeButton} 
                        onClick={onClose}
                        style={{ opacity: (loading || isSubmitting) ? 0.5 : 1 }}
                    >
                        &times;
                    </span>
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>Name</label>
                    <input
                        id="name"
                        name="name" 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        className={styles.formInput} 
                        placeholder="Enter template name"
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="type" className={styles.formLabel}>Type</label>
                    <input
                        id="type"
                        name="type" 
                        type="text" 
                        value={type} 
                        onChange={(e) => setType(e.target.value)} 
                        required 
                        className={styles.formInput} 
                        placeholder="e.g. Status Indicator, Chart, etc."
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="tilebackgroundcolor" className={styles.formLabel}>Tile Background Color</label>
                    <input
                        id="tilebackgroundcolor"
                        name="tilebackgroundcolor" 
                        type="color" 
                        value={backgroundColor} 
                        onChange={(e) => setBackgroundColor(e.target.value)} 
                        className={styles.formInput} 
                    />
                    <small className={styles.formHelpText}>Background color of the actual tile component</small>
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="previewbackgroundcol" className={styles.formLabel}>Preview Background Color</label>
                    <input
                        id="previewbackgroundcol"
                        name="previewbackgroundcol" 
                        type="color" 
                        value={previewBackgroundColor} 
                        onChange={(e) => setPreviewBackgroundColor(e.target.value)} 
                        className={styles.formInput} 
                    />
                    <small className={styles.formHelpText}>Background color shown in the template list preview</small>
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="iconname" className={styles.formLabel}>Icon Name</label>
                    <input
                        id="iconname"
                        name="iconname" 
                        type="text" 
                        value={iconName} 
                        onChange={(e) => setIconName(e.target.value)} 
                        className={styles.formInput} 
                        placeholder="LineChart"
                    />
                    <small className={styles.formHelpText}>
                        Icon names from <code>lucide-react</code> (e.g., "LineChart", "BarChart", "TrendingUp")
                    </small>
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="iconcolor" className={styles.formLabel}>Icon Color</label>
                    <input
                        id="iconcolor"
                        name="iconcolor" 
                        type="color" 
                        value={iconColor} 
                        onChange={(e) => setIconColor(e.target.value)} 
                        className={styles.formInput} 
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Icon Size</label>
                    <div className={styles.rangeDisplay}>
                        <input id="field8ytmi" name="field8ytmi" 
                            type="range" 
                            min="16" 
                            max="96" 
                            value={iconSize} 
                            onChange={(e) => setIconSize(e.target.value)} 
                            className={`${styles.formRange} ${styles.rangeInput}`}
                        />
                        <span className={styles.rangeValue}>{iconSize}px</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Live Preview:</label>
                    <div 
                        className={styles.tilePreview}
                        style={{ backgroundColor: previewBackgroundColor }}
                    >
                        <JsxParser
                            jsx={jsxCode}
                            components={{ Tile }}
                            onError={(error) => console.error('JSX Parser Error:', error)}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={loading || isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (id ? 'Update Template' : 'Create Template')}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className={styles.cancelButton}
                        disabled={loading || isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TileTemplateForm; 