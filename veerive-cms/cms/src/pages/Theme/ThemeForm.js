import React, { useContext, useState, useEffect } from 'react';
import ThemeContext from '../../context/ThemeContext';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../html/css/Theme.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import TileTemplateContext from '../../context/TileTemplateContext';
import Select from 'react-select';
import JsxParser from 'react-jsx-parser';
import Tile from '../../components/Tile';

// Utility function to clean and normalize HTML content from ReactQuill
const cleanHtmlContent = (html) => {
    if (!html || html === '<p><br></p>' || html === '<p></p>') {
        return '';
    }
    
    // More aggressive cleaning to remove all unwanted line breaks and empty paragraphs
    let cleaned = html
        // Remove all variations of empty paragraphs with line breaks
        .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs with just line breaks
        .replace(/<p><\/p>/g, '') // Remove completely empty paragraphs
        .replace(/<p>\s*<\/p>/g, '') // Remove paragraphs with only whitespace
        .replace(/\s*<p>\s*<br>\s*<\/p>\s*/g, '') // Remove paragraphs with just line breaks and whitespace
        .replace(/\s*<p>\s*<\/p>\s*/g, '') // Remove empty paragraphs with whitespace
        .replace(/<p>\s*<br>\s*<\/p>/g, '') // Remove paragraphs with line breaks and whitespace
        .replace(/\s*<p>\s*<br>\s*<\/p>\s*/g, '') // Remove paragraphs with line breaks and surrounding whitespace
        // Remove multiple consecutive line breaks
        .replace(/(<br\s*\/?>){2,}/g, '<br>') // Replace multiple <br> tags with single one
        .replace(/<p>\s*<br>\s*<\/p>/g, '') // Remove paragraphs containing only <br>
        .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '') // Remove paragraphs containing only <br> with optional self-closing
        // Remove empty paragraphs that might contain only whitespace and line breaks
        .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '') // Remove paragraphs with <br> and whitespace
        .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '') // Remove paragraphs with <br> and whitespace (duplicate for safety)
        // Remove any remaining empty paragraphs
        .replace(/<p>\s*<\/p>/g, '') // Remove any remaining empty paragraphs
        .replace(/<p><br\s*\/?><\/p>/g, '') // Remove paragraphs with just <br> tags
        .trim();
    
    // If the content is empty after cleaning, return empty string
    if (cleaned === '' || cleaned === '<p></p>' || cleaned === '<p><br></p>') {
        return '';
    }
    
    return cleaned;
};

// Specific function to clean methodology content and remove unwanted gaps
const cleanMethodologyContent = (html) => {
    if (!html || html === '<p><br></p>' || html === '<p></p>') {
        return '';
    }
    
    // First apply the general cleaning
    let cleaned = cleanHtmlContent(html);
    
    // Additional specific cleaning for methodology content
    cleaned = cleaned
        // Remove any remaining empty paragraphs between content and lists
        .replace(/<\/p>\s*<p>\s*<br>\s*<\/p>\s*<ul>/g, '</p><ul>') // Remove empty paragraph between paragraph and list
        .replace(/<\/p>\s*<p>\s*<\/p>\s*<ul>/g, '</p><ul>') // Remove empty paragraph between paragraph and list
        .replace(/<\/p>\s*<p>\s*<br\s*\/?>\s*<\/p>\s*<ul>/g, '</p><ul>') // Remove empty paragraph with <br> between paragraph and list
        // Remove any empty paragraphs that might be between the main content and bullet points
        .replace(/(<p>.*?<\/p>)\s*<p>\s*<br>\s*<\/p>\s*(<ul>)/g, '$1$2') // Remove empty paragraph between content and list
        .replace(/(<p>.*?<\/p>)\s*<p>\s*<\/p>\s*(<ul>)/g, '$1$2') // Remove empty paragraph between content and list
        .replace(/(<p>.*?<\/p>)\s*<p>\s*<br\s*\/?>\s*<\/p>\s*(<ul>)/g, '$1$2') // Remove empty paragraph with <br> between content and list
        .trim();
    
    return cleaned;
};

// Utility function to clean nested HTML content in complex objects
const cleanNestedHtmlContent = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const cleaned = { ...obj };
    
    // Recursively clean all string properties that might contain HTML
    for (const key in cleaned) {
        if (typeof cleaned[key] === 'string') {
            cleaned[key] = cleanHtmlContent(cleaned[key]);
        } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
            cleaned[key] = cleanNestedHtmlContent(cleaned[key]);
        }
    }
    
    return cleaned;
};

export default function ThemeForm({ handleFormSubmit }) {
    const { themes, themesDispatch, sectors: sectorsData, subSectors: subSectorsData, setIsFormVisible } = useContext(ThemeContext);
    const { tileTemplates, fetchTileTemplates } = useContext(TileTemplateContext);
    const navigate = useNavigate();

    // Function to clean methodology content for display
    const cleanMethodologyForDisplay = (htmlContent) => {
        if (!htmlContent) return '';

        // Remove empty paragraphs that contain only <br> tags and other variations
        let cleaned = htmlContent
            .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') // <p><br></p>
            .replace(/<p>\s*<\/p>/gi, '') // <p></p>
            .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') // <p><br/></p>
            .replace(/<p><br\s*\/?><\/p>/gi, '') // <p><br></p> (alternative format)
            .replace(/<p><br\s*\/>\s*<\/p>/gi, '') // <p><br/></p> (self-closing)
            .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') // Multiple spaces version
            .replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, '') // With attributes
            .replace(/<p[^>]*>\s*<\/p>/gi, ''); // Any empty paragraphs with attributes

        // Additional cleaning for gaps between paragraphs and lists
        cleaned = cleaned
            .replace(/\s*<p[^>]*>\s*<br\s*\/?>\s*<\/p>\s*<ul>/gi, '<ul>') // Remove empty paragraph before list
            .replace(/\s*<p[^>]*>\s*<\/p>\s*<ul>/gi, '<ul>') // Remove empty paragraph before list
            .replace(/<\/p>\s*<p[^>]*>\s*<br\s*\/?>\s*<\/p>\s*<ul>/gi, '</p><ul>') // Remove empty paragraph between content and list
            .replace(/<\/p>\s*<p[^>]*>\s*<\/p>\s*<ul>/gi, '</p><ul>'); // Remove empty paragraph between content and list

        return cleaned;
    };

    const [themeTitle, setThemeTitle] = useState('');
    const [isTrending, setIsTrending] = useState(false);
    const [doNotPublish, setDoNotPublish] = useState(false);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedSubSectors, setSelectedSubSectors] = useState([]);
    const [themeDescription, setThemeDescription] = useState(''); // New state
    const [teaser, setTeaser] = useState('');
    const [methodology, setMethodology] = useState('');
    const [methodologyIcon, setMethodologyIcon] = useState('');
    const [filteredSubSectors, setFilteredSubSectors] = useState([]);

    // New state for additional fields
    const [trendingScore, setTrendingScore] = useState(0);
    const [impactScore, setImpactScore] = useState(0);
    const [predictiveMomentumScore, setPredictiveMomentumScore] = useState(0);
    const [trendingScoreImage, setTrendingScoreImage] = useState('');
    const [impactScoreImage, setImpactScoreImage] = useState('');
    const [predictiveMomentumScoreImage, setPredictiveMomentumScoreImage] = useState('');
    const overallScoreCalc = (trendingScore * 0.35) + (impactScore * 0.4) + (predictiveMomentumScore * 0.25);

    const [tileTemplateId, setTileTemplateId] = useState(null);

    // New: Drivers, Images and Regions datasets for dropdowns
    const [drivers, setDrivers] = useState([]);
    const [images, setImages] = useState([]);
    const [regions, setRegions] = useState([]);

    // New: Complex nested state per updated theme-model.js
    const [overviewSnapshot, setOverviewSnapshot] = useState({
        trendSnapshot: {
            trendSnapshotIcon: '',
            trendSignificance: { content: '' },
            potentialChallenges: { content: '' },
        },
        marketMetrics: [], // { icon, value, text }
    });

    const [trendAnalysis, setTrendAnalysis] = useState({
        driversAndSignals: {
            keyDrivers: [], // { icon, driverType, driverTitle, description }
            signalsInAction: [], // { logo, title, description, initiative:{description}, strategicImperative:{description} }
        },
        impactAndOpinions: {
            info: '', // New info field
            title: { content: '', explanation: '' },
            disruptivePotential: {
                highLowContainer: { icon: '' },
                content: '',
                value: '',
            },
            trendMomentum: {
                highLowContainer: { icon: '' },
                content: '',
                value: '',
            },
        },
        regionalDynamics: {
            info: '', // New info field
            methodologyIcon: '',
            regionalInsights: {
                overallSummary: '',
                regions: [], // { regionMapIcon, regionName, regionInsight }
            },
        },
        consumerDynamics: {
            info: '', // New info field
            methodologyIcon: '',
            behavioralInsights: [], // { heading, icon, text }
            impactAnalyser: {
                data: [] // { consumerSegmentName, impactScore }
            },
        },
    });

    // Helper: fetch datasets
    useEffect(() => {
        // Ensure tile templates are loaded for the dropdown, especially on hard refresh
        if (Array.isArray(tileTemplates) && tileTemplates.length === 0 && typeof fetchTileTemplates === 'function') {
            fetchTileTemplates();
        }
    }, [tileTemplates.length, fetchTileTemplates]);

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const [driversRes, imagesRes, regionsRes] = await Promise.allSettled([
                    axios.get('/api/admin/drivers', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                    axios.get('/api/admin/images', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                    axios.get('/api/admin/regions', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
                ]);

                // Drivers
                if (driversRes.status === 'fulfilled') {
                    const d = driversRes.value?.data;
                    if (Array.isArray(d)) setDrivers(d);
                    else if (d?.success) setDrivers(d.data || []);
                } else {
                    console.warn('[ThemeForm] Drivers fetch failed (ignored):', driversRes.reason?.message || driversRes.reason);
                }

                // Images
                if (imagesRes.status === 'fulfilled') {
                    const im = imagesRes.value?.data;
                    if (Array.isArray(im)) setImages(im);
                    else if (im?.success) setImages(im.data || []);
                } else {
                    console.warn('[ThemeForm] Images fetch failed (ignored):', imagesRes.reason?.message || imagesRes.reason);
                }

                // Regions (admin)
                let regionsPayload = [];
                if (regionsRes.status === 'fulfilled') {
                    const rg = regionsRes.value?.data;
                    regionsPayload = Array.isArray(rg) ? rg : (rg?.data || []);
                } else {
                    console.warn('[ThemeForm] Admin regions fetch failed, falling back:', regionsRes.reason?.message || regionsRes.reason);
                }

                // Fallback to non-admin route if needed
                if (!Array.isArray(regionsPayload) || regionsPayload.length === 0) {
                    try {
                        const fallback = await axios.get('/api/regions', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                        const fb = fallback.data?.data || fallback.data;
                        if (Array.isArray(fb)) regionsPayload = fb;
                    } catch (err) {
                        console.warn('[ThemeForm] Fallback regions fetch failed:', err?.message || err);
                    }
                }

                if (Array.isArray(regionsPayload)) {
                    setRegions(regionsPayload);
                    try { window.__regions = regionsPayload; } catch (e) {}
                    console.log('[ThemeForm] Regions loaded:', regionsPayload.length, regionsPayload.map(r => r.regionName));
                } else {
                    console.warn('Regions payload not an array:', regionsPayload);
                }
            } catch (e) {
                console.error('Failed to fetch datasets', e);
            }
        };
        fetchDatasets();
    }, []);

    // Local Image selector (dropdown only)
    const ImageSelector = ({ label, value, onChange }) => {
        const options = (images || []).map(img => ({ value: img.imageLink, label: img.imageTitle }));
        const selected = options.find(opt => opt.value === value) || (value ? { value, label: value } : null);

        return (
            <div className="form-group">
                <label><b>{label}</b></label>
                <Select
                    value={selected}
                    onChange={(opt) => onChange(opt ? opt.value : '')}
                    options={options}
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
                    placeholder="Select from image library..."
                    className="theme-select"
                />
            </div>
        );
    };

    // Prepare options for react-select
    const sectorOptions = sectorsData.data?.map(sector => ({ value: sector._id, label: sector.sectorName })) || [];
    const allSubSectorOptions = subSectorsData.data?.map(subSector => ({ value: subSector._id, label: subSector.subSectorName, sectorId: subSector.sectorId })) || [];
    const subSectorOptions = filteredSubSectors.map(subSector => ({ value: subSector._id, label: subSector.subSectorName, sectorId: subSector.sectorId }));

    useEffect(() => {
        if (themes.editId && sectorsData.data?.length > 0 && subSectorsData.data?.length > 0) {
            let theme = themes.data.find((ele) => ele._id === themes.editId);
            if (!theme && themes.allThemes) {
                theme = themes.allThemes.find((ele) => ele._id === themes.editId);
            }
            if (theme) {
                setThemeTitle(theme.themeTitle || '');
                setIsTrending(theme.isTrending || false);
                setDoNotPublish(theme.doNotPublish || false);
                setSelectedSectors((theme.sectors || []).map(id => {
                    const sector = sectorsData.data?.find(s => String(s._id) === String(id));
                    return sector ? { value: sector._id, label: sector.sectorName } : { value: id, label: id };
                }));
                setSelectedSubSectors((theme.subSectors || []).map(id => {
                    const subSector = subSectorsData.data?.find(s => String(s._id) === String(id));
                    return subSector ? { value: subSector._id, label: subSector.subSectorName, sectorId: subSector.sectorId } : { value: id, label: id };
                }));
                setThemeDescription(theme.themeDescription || '');
                setTeaser(theme.teaser || '');
                setMethodology(cleanMethodologyForDisplay(theme.methodology || ''));
                setMethodologyIcon(theme.methodologyIcon || '');
                setTrendingScore(theme.trendingScore || 0);
                setImpactScore(theme.impactScore || 0);
                setPredictiveMomentumScore(theme.predictiveMomentumScore || 0);
                setTrendingScoreImage(theme.trendingScoreImage || '');
                setImpactScoreImage(theme.impactScoreImage || '');
                setPredictiveMomentumScoreImage(theme.predictiveMomentumScoreImage || '');
                // Set tileTemplateId for edit
                if (theme.tileTemplateId) {
                    const template = tileTemplates.find(t => t._id === String(theme.tileTemplateId));
                    if (template) {
                        setTileTemplateId({ value: template._id, label: template.name, jsxCode: template.jsxCode });
                    }
                } else {
                    setTileTemplateId(null);
                }
                // Filter sub-sectors for dropdown display
                if (subSectorsData.data && theme.sectors) {
                    const filtered = subSectorsData.data.filter(subSector => theme.sectors.map(sid => String(sid)).includes(String(subSector.sectorId)));
                    setFilteredSubSectors(filtered);
                }

                // Prefill complex sections
                setOverviewSnapshot({
                    trendSnapshot: {
                        trendSnapshotIcon: theme?.overviewSnapshot?.trendSnapshot?.trendSnapshotIcon || theme?.overviewSnapshot?.executiveSummary?.executiveSummaryIcon || '',
                        trendSignificance: { content: theme?.overviewSnapshot?.trendSnapshot?.trendSignificance?.content || theme?.overviewSnapshot?.executiveSummary?.trendSignificance?.content || '' },
                        potentialChallenges: { content: theme?.overviewSnapshot?.trendSnapshot?.potentialChallenges?.content || theme?.overviewSnapshot?.executiveSummary?.potentialChallenges?.content || '' },
                    },
                    marketMetrics: Array.isArray(theme?.overviewSnapshot?.marketMetrics) ? theme.overviewSnapshot.marketMetrics.map(mm => ({
                        icon: mm.icon || '',
                        value: mm.value || '',
                        text: mm.text || '',
                    })) : [],
                });

                setTrendAnalysis({
                    driversAndSignals: {
                        keyDrivers: Array.isArray(theme?.trendAnalysis?.driversAndSignals?.keyDrivers) ? theme.trendAnalysis.driversAndSignals.keyDrivers.map(kd => ({
                            icon: kd.icon || '',
                            driverType: kd.driverType || null,
                            driverTitle: kd.driverTitle || '',
                            description: kd.description || '',
                        })) : [],
                        signalsInAction: Array.isArray(theme?.trendAnalysis?.driversAndSignals?.signalsInAction) ? theme.trendAnalysis.driversAndSignals.signalsInAction.map(sa => ({
                            logo: sa.logo || '',
                            title: sa.title || '',
                            description: sa.description || '',
                            initiative: { description: sa?.initiative?.description || '' },
                            strategicImperative: { description: sa?.strategicImperative?.description || '' },
                        })) : [],
                    },
                    impactAndOpinions: {
                        info: theme?.trendAnalysis?.impactAndOpinions?.info || '', // New info field
                        title: {
                            content: theme?.trendAnalysis?.impactAndOpinions?.title?.content || '',
                            explanation: theme?.trendAnalysis?.impactAndOpinions?.title?.explanation || '',
                        },
                        disruptivePotential: {
                            highLowContainer: {
                                icon: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer?.icon || '',
                            },
                            content: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.content || '',
                            value: theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.value || '',
                        },
                        trendMomentum: {
                            highLowContainer: {
                                icon: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer?.icon || '',
                            },
                            content: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.content || '',
                            value: theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.value || '',
                        },
                    },
                    regionalDynamics: {
                        info: theme?.trendAnalysis?.regionalDynamics?.info || '', // New info field
                        methodologyIcon: theme?.trendAnalysis?.regionalDynamics?.methodologyIcon || '',
                        regionalInsights: {
                            overallSummary: theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.overallSummary || '',
                            regions: Array.isArray(theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.regions) ? theme.trendAnalysis.regionalDynamics.regionalInsights.regions.map(r => ({
                                regionMapIcon: r.regionMapIcon || '',
                                regionName: r.regionName || '',
                                regionInsight: r.regionInsight || '',
                                regionScore: typeof r.regionScore === 'number' ? r.regionScore : 0,
                            })) : [],
                        },
                    },
                    consumerDynamics: {
                        info: theme?.trendAnalysis?.consumerDynamics?.info || '', // New info field
                        methodologyIcon: theme?.trendAnalysis?.consumerDynamics?.methodologyIcon || '',
                        behavioralInsights: Array.isArray(theme?.trendAnalysis?.consumerDynamics?.behavioralInsights) ? theme.trendAnalysis.consumerDynamics.behavioralInsights.map(b => ({
                            heading: b.heading || '',
                            icon: b.icon || '',
                            text: b.text || '',
                        })) : [],
                        impactAnalyser: {
                            data: Array.isArray(theme?.trendAnalysis?.consumerDynamics?.impactAnalyser?.data) ? theme.trendAnalysis.consumerDynamics.impactAnalyser.data.map(i => ({
                                consumerSegmentName: i.consumerSegmentName || '',
                                impactScore: typeof i.impactScore === 'number' ? i.impactScore : 0,
                            })) : Array.isArray(theme?.trendAnalysis?.consumerDynamics?.impactAnalyser) ? theme.trendAnalysis.consumerDynamics.impactAnalyser.map(i => ({
                                consumerSegmentName: i.consumerSegmentName || '',
                                impactScore: typeof i.impactScore === 'number' ? i.impactScore : 0,
                            })) : [] // Backward compatibility
                        },
                    },
                });
            } else {
                console.error("Theme not found with ID:", themes.editId);
            }
        } else if (!themes.editId) {
            // Reset form for new theme
            setThemeTitle('');
            setIsTrending(false);
            setDoNotPublish(false);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setThemeDescription('');
            setTeaser('');
            setMethodology(''); // Will be cleaned by cleanMethodologyForDisplay if needed
            setMethodologyIcon('');
            setFilteredSubSectors([]);
            setTrendingScore(0);
            setImpactScore(0);
            setPredictiveMomentumScore(0);
            setTrendingScoreImage('');
            setImpactScoreImage('');
            setPredictiveMomentumScoreImage('');
            setTileTemplateId(null);

            setOverviewSnapshot({
                trendSnapshot: {
                    trendSnapshotIcon: '',
                    trendSignificance: { content: '' },
                    potentialChallenges: { content: '' },
                },
                marketMetrics: [],
            });
            setTrendAnalysis({
                driversAndSignals: { keyDrivers: [], signalsInAction: [] },
                impactAndOpinions: {
                    title: { content: '', explanation: '' },
                    disruptivePotential: { highLowContainer: { icon: '' }, content: '', value: '' },
                    trendMomentum: { highLowContainer: { icon: '' }, content: '', value: '' },
                },
                    regionalDynamics: {
                        methodologyIcon: '',
                        regionalInsights: { overallSummary: '', regions: [] },
                    },
                consumerDynamics: { info: '', methodologyIcon: '', behavioralInsights: [], impactAnalyser: { data: [] } },
            });
        }
    }, [themes.editId, themes.data, themes.allThemes, subSectorsData.data, tileTemplates]);

    // Update filteredSubSectors when selectedSectors changes
    useEffect(() => {
        if (subSectorsData.data && selectedSectors.length > 0) {
            const selectedSectorIds = selectedSectors.map(s => s.value);
            const filtered = subSectorsData.data.filter(subSector => selectedSectorIds.includes(subSector.sectorId));
            setFilteredSubSectors(filtered);
        } else {
            setFilteredSubSectors([]);
        }
    }, [selectedSectors, subSectorsData.data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Debug: Log the original methodology content and cleaned version
        if (methodology && methodology.includes('<p>') && methodology.includes('<ul>')) {
            console.log('=== METHODOLOGY DEBUG ===');
            console.log('Original methodology HTML:', methodology);
            const cleanedMethodology = cleanMethodologyForDisplay(methodology);
            console.log('Cleaned methodology HTML:', cleanedMethodology);
            console.log('HTML is clean - gap is caused by CSS margins');
            console.log('Check browser DevTools for .methodology-editor CSS rules');
        }
        
        const formData = {
            themeTitle,
            isTrending,
            doNotPublish,
            sectors: selectedSectors.map(s => s.value),
            subSectors: selectedSubSectors.map(s => s.value),
            themeDescription, // Raw HTML content without cleaning
            teaser, // Raw HTML content without cleaning
            methodology, // Raw HTML content (cleaning applied during display)
            methodologyIcon,
            overallScore: overallScoreCalc,
            trendingScore,
            impactScore,
            predictiveMomentumScore,
            trendingScoreImage,
            impactScoreImage,
            predictiveMomentumScoreImage,
            tileTemplateId: tileTemplateId ? tileTemplateId.value : null,
            overviewSnapshot, // Raw nested content without cleaning
            trendAnalysis, // Raw nested content without cleaning
        };

        try {
            if (themes.editId) {
                const response = await axios.put(`/api/admin/themes/${themes.editId}`, formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                themesDispatch({ type: 'UPDATE_THEME', payload: response.data });
                handleFormSubmit('Theme updated successfully');
            } else {
                const response = await axios.post('/api/admin/themes', formData, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                themesDispatch({ type: 'ADD_THEME', payload: response.data });
                handleFormSubmit('Theme added successfully');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred while submitting the form.');
        }
    };

    const handleSectorChange = (selectedOptions) => {
        setSelectedSectors(selectedOptions || []);
    };

    const handleSubSectorChange = (selectedOptions) => {
        setSelectedSubSectors(selectedOptions || []);
    };

    const handleHomeNav = () => {
        // Clear edit state
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        // Hide the form
        setIsFormVisible(false);
        // Navigate to themes list
        navigate('/themes');
    };

    return (
        <div className={styles.companyFormContainer}>
            <button type="button" className={styles.cancelBtn} style={{ marginBottom: 20 }} onClick={handleHomeNav}>
                ← Back to Themes
            </button>
            <h2>{themes.editId ? 'Edit Theme' : 'Add Theme'}</h2>

            <form onSubmit={handleSubmit} className={styles.companyForm}>
                <div className="form-group">
                    <label htmlFor="themeTitle"><b>Theme Title</b> <span style={{color: 'red'}}>*</span></label>
                    <input
                        id="themeTitle"
                        type="text"
                        placeholder="Theme Title"
                        name="themeTitle"
                        value={themeTitle}
                        onChange={(e) => setThemeTitle(e.target.value)}
                        className="theme-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="themeDescription"><b>Theme Description</b> <span style={{color: 'red'}}>*</span></label>
                    <ReactQuill
                        id="themeDescription"
                        value={themeDescription}
                        onChange={setThemeDescription}
                        className="theme-quill-editor no-gap-editor"
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

                <div className="form-group">
                    <label htmlFor="teaser"><b>Teaser</b></label>
                    <ReactQuill
                        id="teaser"
                        value={teaser}
                        onChange={setTeaser}
                        className="theme-quill-editor no-gap-editor"
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

                <div className="form-group">
                    <label htmlFor="methodology"><b>Methodology</b></label>
                    <ImageSelector
                        label="Methodology Icon"
                        value={methodologyIcon}
                        onChange={setMethodologyIcon}
                    />
                    <ReactQuill
                        id="methodology"
                        value={methodology}
                        onChange={setMethodology}
                        className="theme-quill-editor no-gap-editor"
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

                {/* Overview / Snapshot Section */}
                <div style={{ 
                    marginTop: 32, 
                    border: '2px solid #e1e5e9', 
                    borderRadius: 8, 
                    padding: 0,
                    backgroundColor: '#f8f9fa'
                }}>
                    <details style={{ margin: 0 }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            padding: '16px 20px', 
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            fontSize: '1.1rem',
                            borderRadius: '6px 6px 0 0',
                            border: 'none',
                            outline: 'none'
                        }}>
                            📊 Overview / Snapshot
                        </summary>
                        <div style={{ padding: '20px', backgroundColor: 'white' }}>
                            <div style={{ marginBottom: 24 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1rem'
                                    }}>
                                        Trend Snapshot
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                <ImageSelector
                                    label="Trend Snapshot Icon"
                                    value={overviewSnapshot.trendSnapshot.trendSnapshotIcon}
                                    onChange={(url) => setOverviewSnapshot(prev => ({
                                        ...prev,
                                        trendSnapshot: { ...prev.trendSnapshot, trendSnapshotIcon: url }
                                    }))}
                                />
                                <div className="form-group">
                                    <label><b>Trend Significance</b></label>
                                    <ReactQuill
                                        value={overviewSnapshot.trendSnapshot.trendSignificance.content}
                                        onChange={(val) => setOverviewSnapshot(prev => ({
                                            ...prev,
                                            trendSnapshot: { ...prev.trendSnapshot, trendSignificance: { content: val } }
                                        }))}
                                        className="theme-quill-editor no-gap-editor"
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
                                <div className="form-group">
                                    <label><b>Potential Challenges</b></label>
                                    <ReactQuill
                                        value={overviewSnapshot.trendSnapshot.potentialChallenges.content}
                                        onChange={(val) => setOverviewSnapshot(prev => ({
                                            ...prev,
                                            trendSnapshot: { ...prev.trendSnapshot, potentialChallenges: { content: val } }
                                        }))}
                                        className="theme-quill-editor no-gap-editor"
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
                                    </div>
                                </details>
                            </div>

                            {/* Market Metrics (max 4) */}
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1rem'
                                    }}>
                                        Market Metrics (up to 4)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                {overviewSnapshot.marketMetrics.map((mm, idx) => (
                                    <div key={idx} style={{ 
                                        border: '1px solid #d1d5db', 
                                        padding: 16, 
                                        marginBottom: 12, 
                                        borderRadius: 6,
                                        backgroundColor: '#f9fafb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <h5 style={{ margin: 0, color: '#6b7280' }}>Metric #{idx + 1}</h5>
                                            <button 
                                                type="button" 
                                                className={styles.cancelBtn} 
                                                onClick={() => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.filter((_, i) => i !== idx)
                                                }))}
                                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <ImageSelector
                                            label={`Icon #${idx + 1}`}
                                            value={mm.icon}
                                            onChange={(url) => setOverviewSnapshot(prev => ({
                                                ...prev,
                                                marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, icon: url } : m)
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Value</b></label>
                                            <input
                                                type="text"
                                                className="theme-input"
                                                value={mm.value}
                                                onChange={(e) => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, value: e.target.value } : m)
                                                }))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><b>Text</b></label>
                                            <ReactQuill
                                                value={mm.text}
                                                onChange={(val) => setOverviewSnapshot(prev => ({
                                                    ...prev,
                                                    marketMetrics: prev.marketMetrics.map((m, i) => i === idx ? { ...m, text: val } : m)
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
                                                style={{
                                                    '--quill-editor-p-margin': '0',
                                                    '--quill-editor-ul-margin': '0',
                                                    '--quill-editor-gap': '0'
                                                }}
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
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => setOverviewSnapshot(prev => ({ ...prev, marketMetrics: [...prev.marketMetrics, { icon: '', value: '', text: '' }] }))}
                                    disabled={overviewSnapshot.marketMetrics.length >= 4}
                                    style={{ marginTop: 8 }}
                                >
                                    + Add Market Metric
                                </button>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Trend Analysis Section */}
                <div style={{ 
                    marginTop: 32, 
                    border: '2px solid #e1e5e9', 
                    borderRadius: 8, 
                    padding: 0,
                    backgroundColor: '#f8f9fa'
                }}>
                    <details style={{ margin: 0 }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            padding: '16px 20px', 
                            backgroundColor: '#059669',
                            color: 'white',
                            fontSize: '1.1rem',
                            borderRadius: '6px 6px 0 0',
                            border: 'none',
                            outline: 'none'
                        }}>
                            📈 Trend Analysis
                        </summary>
                        <div style={{ padding: '20px', backgroundColor: 'white' }}>
                            
                            {/* 1. Drivers and Signals */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        🚀 1. Drivers and Signals
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                
                                {/* Key Drivers */}
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Key Drivers (up to 8)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.driversAndSignals.keyDrivers.map((kd, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Driver #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <ImageSelector
                                                    label={`Icon #${idx + 1}`}
                                                    value={kd.icon}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, icon: url } : k) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Driver Type</b></label>
                                                    <Select
                                                        value={kd.driverType ? { value: kd.driverType, label: (drivers.find(d => String(d._id) === String(kd.driverType))?.driverName) || 'Selected' } : null}
                                                        onChange={(opt) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, driverType: opt ? opt.value : null } : k) }
                                                        }))}
                                                        options={(drivers || []).map(d => ({ value: d._id, label: d.driverName }))}
                                                        isClearable
                                                        placeholder="Select driver type..."
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Driver Title</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={kd.driverTitle}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, driverTitle: e.target.value } : k) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Description</b></label>
                                                    <ReactQuill
                                                        value={kd.description}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, keyDrivers: prev.driversAndSignals.keyDrivers.map((k, i) => i === idx ? { ...k, description: val } : k) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, driversAndSignals: { ...prev.driversAndSignals, keyDrivers: [...prev.driversAndSignals.keyDrivers, { icon: '', driverType: null, driverTitle: '', description: '' }] } }))}
                                            disabled={trendAnalysis.driversAndSignals.keyDrivers.length >= 8}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Key Driver
                                        </button>
                                    </div>
                                </details>

                                {/* Signals in Action */}
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Signals in Action (up to 8)
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.driversAndSignals.signalsInAction.map((sa, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Signal #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <ImageSelector
                                                    label={`Logo #${idx + 1}`}
                                                    value={sa.logo}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, logo: url } : s) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Title</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={sa.title}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, title: e.target.value } : s) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Description</b></label>
                                                    <ReactQuill
                                                        value={sa.description}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, description: val } : s) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Initiative - Description</b></label>
                                                    <ReactQuill
                                                        value={sa.initiative?.description || ''}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, initiative: { description: val } } : s) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Strategic Imperative - Description</b></label>
                                                    <ReactQuill
                                                        value={sa.strategicImperative?.description || ''}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            driversAndSignals: { ...prev.driversAndSignals, signalsInAction: prev.driversAndSignals.signalsInAction.map((s, i) => i === idx ? { ...s, strategicImperative: { description: val } } : s) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, driversAndSignals: { ...prev.driversAndSignals, signalsInAction: [...prev.driversAndSignals.signalsInAction, { logo: '', title: '', description: '', initiative: { description: '' }, strategicImperative: { description: '' } }] } }))}
                                            disabled={trendAnalysis.driversAndSignals.signalsInAction.length >= 8}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Signal
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 2. Impact and Opinions */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        💡 2. Impact and Opinions
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <div className="form-group">
                                            <label htmlFor="impactAndOpinionsInfo"><b>Info</b></label>
                                            <ReactQuill
                                                id="impactAndOpinionsInfo"
                                                value={trendAnalysis.impactAndOpinions.info}
                                                onChange={(value) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, info: value }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
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
                                <div className="form-group">
                                    <label><b>Title</b></label>
                                    <input
                                        type="text"
                                        className="theme-input"
                                        value={trendAnalysis.impactAndOpinions.title.content}
                                        onChange={(e) => setTrendAnalysis(prev => ({
                                            ...prev,
                                            impactAndOpinions: { ...prev.impactAndOpinions, title: { ...prev.impactAndOpinions.title, content: e.target.value } }
                                        }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><b>Explanation</b></label>
                                    <ReactQuill
                                        value={trendAnalysis.impactAndOpinions.title.explanation}
                                        onChange={(val) => setTrendAnalysis(prev => ({
                                            ...prev,
                                            impactAndOpinions: { ...prev.impactAndOpinions, title: { ...prev.impactAndOpinions.title, explanation: val } }
                                        }))}
                                        className="theme-quill-editor no-gap-editor"
                                    />
                                </div>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Disruptive Potential
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <ImageSelector
                                            label="Icon"
                                            value={trendAnalysis.impactAndOpinions.disruptivePotential.highLowContainer.icon}
                                            onChange={(url) => setTrendAnalysis(prev => ({
                                                ...prev,
                                                impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, highLowContainer: { ...prev.impactAndOpinions.disruptivePotential.highLowContainer, icon: url } } }
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Content</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.impactAndOpinions.disruptivePotential.content}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, disruptivePotential: { ...prev.impactAndOpinions.disruptivePotential, content: val } }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
                                                style={{
                                                    '--quill-editor-p-margin': '0',
                                                    '--quill-editor-ul-margin': '0',
                                                    '--quill-editor-gap': '0'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </details>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Trend Momentum
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <ImageSelector
                                            label="Icon"
                                            value={trendAnalysis.impactAndOpinions.trendMomentum.highLowContainer.icon}
                                            onChange={(url) => setTrendAnalysis(prev => ({
                                                ...prev,
                                                impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, highLowContainer: { ...prev.impactAndOpinions.trendMomentum.highLowContainer, icon: url } } }
                                            }))}
                                        />
                                        <div className="form-group">
                                            <label><b>Content</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.impactAndOpinions.trendMomentum.content}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    impactAndOpinions: { ...prev.impactAndOpinions, trendMomentum: { ...prev.impactAndOpinions.trendMomentum, content: val } }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
                                                style={{
                                                    '--quill-editor-p-margin': '0',
                                                    '--quill-editor-ul-margin': '0',
                                                    '--quill-editor-gap': '0'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 3. Regional Dynamics */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        🌍 3. Regional Dynamics
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <div className="form-group">
                                            <label htmlFor="regionalDynamicsInfo"><b>Info</b></label>
                                            <ReactQuill
                                                id="regionalDynamicsInfo"
                                                value={trendAnalysis.regionalDynamics.info}
                                                onChange={(value) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    regionalDynamics: { ...prev.regionalDynamics, info: value }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
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
                                <ImageSelector
                                    label="Methodology Icon"
                                    value={trendAnalysis.regionalDynamics.methodologyIcon}
                                    onChange={(url) => setTrendAnalysis(prev => ({
                                        ...prev,
                                        regionalDynamics: { ...prev.regionalDynamics, methodologyIcon: url }
                                    }))}
                                />

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Regional Insights
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <div className="form-group">
                                            <label><b>Overall Summary</b></label>
                                            <ReactQuill
                                                value={trendAnalysis.regionalDynamics.regionalInsights.overallSummary}
                                                onChange={(val) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, overallSummary: val } }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
                                                style={{
                                                    '--quill-editor-p-margin': '0',
                                                    '--quill-editor-ul-margin': '0',
                                                    '--quill-editor-gap': '0'
                                                }}
                                            />
                                        </div>
                                        {trendAnalysis.regionalDynamics.regionalInsights.regions.map((r, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Region #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, regions: prev.regionalDynamics.regionalInsights.regions.filter((_, i) => i !== idx) } }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Select Region</b></label>
                                                    <Select
                                                        onMenuOpen={() => {
                                                            console.log('[ThemeForm] Region select opened. Regions count:', regions.length);
                                                            console.log('[ThemeForm] First 5 regions:', regions.slice(0,5));
                                                        }}
                                                        value={r.regionId ? { value: r.regionId, label: (regions.find(reg => String(reg._id) === String(r.regionId))?.regionName) || 'Selected Region' } : null}
                                                        onChange={(opt) => {
                                                            const selectedRegion = regions.find(reg => String(reg._id) === String(opt?.value));
                                                            console.log('[ThemeForm] Region selected:', opt, 'resolved:', selectedRegion);
                                                            setTrendAnalysis(prev => ({
                                                                ...prev,
                                                                regionalDynamics: { 
                                                                    ...prev.regionalDynamics, 
                                                                    regionalInsights: { 
                                                                        ...prev.regionalDynamics.regionalInsights, 
                                                                        regions: prev.regionalDynamics.regionalInsights.regions.map((x, i) => i === idx ? { 
                                                                            ...x, 
                                                                            regionId: opt ? opt.value : null,
                                                                            regionMapIcon: selectedRegion?.regionIcon || '',
                                                                            regionName: selectedRegion?.regionName || '',
                                                                            regionInsight: selectedRegion?.regionInsight || ''
                                                                        } : x) 
                                                                    } 
                                                                } 
                                                            }));
                                                        }}
                                                        options={(regions || []).map(reg => ({ value: reg._id, label: reg.regionName }))}
                                                        isClearable
                                                        placeholder="Select a region..."
                                                    />
                                                </div>
                                                {r.regionMapIcon && (
                                                    <div className="form-group">
                                                        <label><b>Region Icon</b></label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <img src={r.regionMapIcon} alt={r.regionName} style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }} />
                                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Fetched from region</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {r.regionName && (
                                                    <div className="form-group">
                                                        <label><b>Region Name</b></label>
                                                        <input
                                                            type="text"
                                                            className="theme-input"
                                                            value={r.regionName}
                                                            readOnly
                                                            style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-group">
                                                    <label><b>Region Insight</b></label>
                                                    <ReactQuill
                                                        value={r.regionInsight || ''}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: {
                                                                ...prev.regionalDynamics,
                                                                regionalInsights: {
                                                                    ...prev.regionalDynamics.regionalInsights,
                                                                    regions: prev.regionalDynamics.regionalInsights.regions.map((x, i) => i === idx ? { ...x, regionInsight: val } : x)
                                                                }
                                                            }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
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
                                                <div className="form-group">
                                                    <label><b>Region Score</b></label>
                                                    <input
                                                        type="number"
                                                        className="theme-input"
                                                        value={r.regionScore || 0}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            regionalDynamics: {
                                                                ...prev.regionalDynamics,
                                                                regionalInsights: {
                                                                    ...prev.regionalDynamics.regionalInsights,
                                                                    regions: prev.regionalDynamics.regionalInsights.regions.map((x, i) => i === idx ? { ...x, regionScore: Number(e.target.value) } : x)
                                                                }
                                                            }
                                                        }))}
                                                        placeholder="Enter region score"
                                                        min="0"
                                                        max="100"
                                                        step="any"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, regionalDynamics: { ...prev.regionalDynamics, regionalInsights: { ...prev.regionalDynamics.regionalInsights, regions: [...prev.regionalDynamics.regionalInsights.regions, { regionMapIcon: '', regionName: '', regionInsight: '', regionScore: 0 }] } } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Region
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>

                            {/* 4. Consumer Dynamics */}
                            <div style={{ marginBottom: 32 }}>
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: 600, 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 4, 
                                        marginBottom: 12,
                                        color: '#374151', 
                                        fontSize: '1.1rem', 
                                        borderBottom: '2px solid #e5e7eb', 
                                        paddingBottom: 8 
                                    }}>
                                        👥 4. Consumer Dynamics
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        <div className="form-group">
                                            <label htmlFor="consumerDynamicsInfo"><b>Info</b></label>
                                            <ReactQuill
                                                id="consumerDynamicsInfo"
                                                value={trendAnalysis.consumerDynamics.info}
                                                onChange={(value) => setTrendAnalysis(prev => ({
                                                    ...prev,
                                                    consumerDynamics: { ...prev.consumerDynamics, info: value }
                                                }))}
                                                className="theme-quill-editor no-gap-editor"
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
                                <ImageSelector
                                    label="Methodology Icon"
                                    value={trendAnalysis.consumerDynamics.methodologyIcon}
                                    onChange={(url) => setTrendAnalysis(prev => ({
                                        ...prev,
                                        consumerDynamics: { ...prev.consumerDynamics, methodologyIcon: url }
                                    }))}
                                />
                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Behavioral Insights
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.consumerDynamics.behavioralInsights.map((b, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Insight #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.filter((_, i) => i !== idx) }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Heading</b></label>
                                                    <ReactQuill
                                                        value={b.heading}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, heading: val } : x) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                                <ImageSelector
                                                    label={`Icon #${idx + 1}`}
                                                    value={b.icon}
                                                    onChange={(url) => setTrendAnalysis(prev => ({
                                                        ...prev,
                                                        consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, icon: url } : x) }
                                                    }))}
                                                />
                                                <div className="form-group">
                                                    <label><b>Text</b></label>
                                                    <ReactQuill
                                                        value={b.text}
                                                        onChange={(val) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: prev.consumerDynamics.behavioralInsights.map((x, i) => i === idx ? { ...x, text: val } : x) }
                                                        }))}
                                                        className="theme-quill-editor no-gap-editor"
                                                        style={{
                                                            '--quill-editor-p-margin': '0',
                                                            '--quill-editor-ul-margin': '0',
                                                            '--quill-editor-gap': '0'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ ...prev, consumerDynamics: { ...prev.consumerDynamics, behavioralInsights: [...prev.consumerDynamics.behavioralInsights, { heading: '', icon: '', text: '' }] } }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Insight
                                        </button>
                                    </div>
                                </details>

                                <details style={{ marginBottom: 20 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
                                        Impact Analyser
                                    </summary>
                                    <div style={{ padding: '12px 0' }}>
                                        {trendAnalysis.consumerDynamics.impactAnalyser.data.map((i, idx) => (
                                            <div key={idx} style={{ 
                                                border: '1px solid #d1d5db', 
                                                padding: 16, 
                                                marginBottom: 12, 
                                                borderRadius: 6,
                                                backgroundColor: '#f9fafb'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <h5 style={{ margin: 0, color: '#6b7280' }}>Segment #{idx + 1}</h5>
                                                    <button 
                                                        type="button" 
                                                        className={styles.cancelBtn} 
                                                        onClick={() => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { 
                                                                ...prev.consumerDynamics, 
                                                                impactAnalyser: { 
                                                                    ...prev.consumerDynamics.impactAnalyser, 
                                                                    data: prev.consumerDynamics.impactAnalyser.data.filter((_, i) => i !== idx) 
                                                                } 
                                                            }
                                                        }))}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Consumer Segment Name</b></label>
                                                    <input
                                                        type="text"
                                                        className="theme-input"
                                                        value={i.consumerSegmentName}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { 
                                                                ...prev.consumerDynamics, 
                                                                impactAnalyser: { 
                                                                    ...prev.consumerDynamics.impactAnalyser, 
                                                                    data: prev.consumerDynamics.impactAnalyser.data.map((x, ix) => ix === idx ? { ...x, consumerSegmentName: e.target.value } : x) 
                                                                } 
                                                            }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label><b>Impact Score (%)</b></label>
                                                    <input
                                                        type="number"
                                                        className="theme-input"
                                                        value={i.impactScore}
                                                        onChange={(e) => setTrendAnalysis(prev => ({
                                                            ...prev,
                                                            consumerDynamics: { 
                                                                ...prev.consumerDynamics, 
                                                                impactAnalyser: { 
                                                                    ...prev.consumerDynamics.impactAnalyser, 
                                                                    data: prev.consumerDynamics.impactAnalyser.data.map((x, ix) => ix === idx ? { ...x, impactScore: Number(e.target.value) } : x) 
                                                                } 
                                                            }
                                                        }))}
                                                        step="any"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className={styles.primaryButton} 
                                            onClick={() => setTrendAnalysis(prev => ({ 
                                                ...prev, 
                                                consumerDynamics: { 
                                                    ...prev.consumerDynamics, 
                                                    impactAnalyser: { 
                                                        ...prev.consumerDynamics.impactAnalyser, 
                                                        data: [...prev.consumerDynamics.impactAnalyser.data, { consumerSegmentName: '', impactScore: 0 }] 
                                                    } 
                                                } 
                                            }))}
                                            style={{ marginTop: 8 }}
                                        >
                                            + Add Segment
                                        </button>
                                    </div>
                                </details>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ 
                            position: 'relative', 
                            display: 'inline-block', 
                            width: '45px', 
                            height: '24px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isTrending}
                                onChange={(e) => setIsTrending(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: isTrending ? '#3b82f6' : '#ccc',
                                transition: '.4s',
                                borderRadius: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px',
                                    width: '18px',
                                    left: isTrending ? '24px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }}></span>
                            </span>
                        </label>
                        <span style={{ color: '#333', fontSize: '14px' }}>
                            Is Trending?
                        </span>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ 
                            position: 'relative', 
                            display: 'inline-block', 
                            width: '45px', 
                            height: '24px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={!doNotPublish}
                                onChange={(e) => setDoNotPublish(!e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: doNotPublish ? '#ccc' : '#3b82f6',
                                transition: '.4s',
                                borderRadius: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px',
                                    width: '18px',
                                    left: doNotPublish ? '3px' : '24px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }}></span>
                            </span>
                        </label>
                        <span style={{ color: '#333', fontSize: '14px' }}>
                            {doNotPublish ? 'Do Not Publish' : 'Publish'}
                        </span>
                    </div>
                </div>

                <div className="form-group scores-group">
                    <div className="score-field">
                        <label htmlFor="trendingScore"><b>Trending Score</b></label>
                        <input
                            id="trendingScore"
                            type="number"
                            placeholder="Trending Score"
                            value={trendingScore}
                            onChange={(e) => setTrendingScore(Number(e.target.value))}
                            className="theme-input"
                        />
                    </div>

                    <div className="score-field">
                        <label htmlFor="impactScore"><b>Impact Score</b></label>
                        <input
                            id="impactScore"
                            type="number"
                            placeholder="Impact Score"
                            value={impactScore}
                            onChange={(e) => setImpactScore(Number(e.target.value))}
                            className="theme-input"
                            step="any"
                        />
                    </div>

                    <div className="score-field">
                        <label htmlFor="predictiveMomentumScore"><b>Predictive Momentum Score</b></label>
                        <input
                            id="predictiveMomentumScore"
                            type="number"
                            placeholder="Predictive Momentum Score"
                            value={predictiveMomentumScore}
                            onChange={(e) => setPredictiveMomentumScore(Number(e.target.value))}
                            className="theme-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="trendingScoreImage"><b>Trending Score Image URL</b></label>
                    <input name="trendingscoreimageurl" id="trendingScoreImage"
                        type="text"
                        placeholder="Trending Score Image URL"
                        value={trendingScoreImage}
                        onChange={(e) => setTrendingScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="impactScoreImage"><b>Impact Score Image URL</b></label>
                    <input name="impactscoreimageurl" id="impactScoreImage"
                        type="text"
                        placeholder="Impact Score Image URL"
                        value={impactScoreImage}
                        onChange={(e) => setImpactScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="predictiveMomentumScoreImage"><b>Predictive Momentum Score Image URL</b></label>
                    <input name="predictivemomentumscoreimageurl" id="predictiveMomentumScoreImage"
                        type="text"
                        placeholder="Predictive Momentum Score Image URL"
                        value={predictiveMomentumScoreImage}
                        onChange={(e) => setPredictiveMomentumScoreImage(e.target.value)}
                        className="theme-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sectors"><b>Sectors</b> <span style={{color: 'red'}}>*</span></label>
                    <Select
                        id="sectors"
                        name="sectors"
                        value={selectedSectors}
                        onChange={handleSectorChange}
                        options={sectorOptions}
                        isMulti
                        className="theme-select"
                        required
                        placeholder="Select sectors..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subSectors"><b>Select Sub-Sectors</b></label>
                    <Select
                        id="subSectors"
                        name="subSectors"
                        value={selectedSubSectors}
                        onChange={handleSubSectorChange}
                        options={subSectorOptions}
                        isMulti
                        className="theme-select"
                        placeholder="Select sub-sectors..."
                    />
                </div>

                <div className="form-group">
                    <label>Tile Template</label>
                    <Select name="select" id="selectField" value={tileTemplateId}
                        onChange={setTileTemplateId}
                        options={tileTemplates.map(template => ({ value: template._id, label: template.name, jsxCode: template.jsxCode }))}
                        formatOptionLabel={({ label, jsxCode }) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                                <div style={{
                                    minWidth: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        transform: 'scale(0.6)',
                                        transformOrigin: 'center center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <JsxParser
                                            jsx={jsxCode}
                                            components={{ Tile }}
                                            onError={(error) => console.error('JSX Parser Error:', error)}
                                        />
                                    </div>
                                </div>
                                <span>{label}</span>
                            </div>
                        )}
                        isClearable
                        placeholder="Select a Tile Template"
                        isSearchable={true}
                        filterOption={(option, inputValue) => {
                            const label = option.label || '';
                            const jsxCode = option.data.jsxCode || '';
                            return (
                                label.toLowerCase().includes(inputValue.toLowerCase()) ||
                                jsxCode.toLowerCase().includes(inputValue.toLowerCase())
                            );
                        }}
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.companySubmitBtn}>
                        {themes.editId ? 'Update Theme' : 'Add Theme'}
                    </button>
                    <button type="button" onClick={handleHomeNav} className={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
