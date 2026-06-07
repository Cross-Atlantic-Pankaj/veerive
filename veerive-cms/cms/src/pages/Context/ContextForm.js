import React, { useContext, useState, useEffect } from 'react';
import ContextContext from '../../context/ContextContext';
import axios from '../../config/axios';
import Select from 'react-select';
import Quill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import '../../html/css/Context.css';
import { toast } from 'react-toastify'; // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import toast styles
import PostContext from '../../context/PostContext';
import ThemeContext from '../../context/ThemeContext';
import TileTemplateContext from '../../context/TileTemplateContext';
import SectorContext from '../../context/SectorContext';
import SubSectorContext from '../../context/SubSectorContext';
import SignalContext from '../../context/SignalContext';
import SubSignalContext from '../../context/SubSignalContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload';

export default function ContextForm({ handleFormSubmit }) {
    const { contexts, contextsDispatch, sectors: sectorsData, subSectors: subSectorsData, signals: signalsData, subSignals: subSignalsData, setIsFormVisible, allThemes, fetchAllThemes } = useContext(ContextContext);
    const{  fetchPosts} = useContext(PostContext)
    const { tileTemplates, fetchTileTemplates } = useContext(TileTemplateContext);
    
    // ✅ Get fetch functions from all dependency contexts
    const { fetchSectors } = useContext(SectorContext);
    const { fetchSubSectors } = useContext(SubSectorContext);
    const { fetchSignals } = useContext(SignalContext);
    const { fetchSubSignals } = useContext(SubSignalContext);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const editIdFromQuery = queryParams.get('editId');
    // State for form inputs
    const [posts, setPosts] = useState([]); // ✅ Store posts locally inside the component
    const [selectedPosts, setSelectedPosts] = useState([]); // ✅ Local selected posts state
    const [contextTitle, setContextTitle] = useState('');
    const [date, setDate] = useState(''); // New state for date field
    const [containerType, setContainerType] = useState('Type-One'); // New state for container type
    const [isTrending, setIsTrending] = useState(false);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedSubSectors, setSelectedSubSectors] = useState([]);
    const [selectedSignalCategories, setSelectedSignalCategories] = useState([]);
    const [selectedSignalSubCategories, setSelectedSignalSubCategories] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedTileTemplates, setSelectedTileTemplates] = useState([]);
    const [bannerShow, setBannerShow] = useState(false);
    const [homePageShow, setHomePageShow] = useState(false);
    const [doNotPublish, setDoNotPublish] = useState(false);
    const [bannerImage, setBannerImage] = useState('');
    const [otherImage, setOtherImage] = useState('');
    const [dataForTypeNum, setDataForTypeNum] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // Image URL for context
    
    const [summary, setSummary] = useState('');
    const [postOptions, setPostOptions] = useState([]); // ✅ Store processed post options
    const [hasSlider, setHasSlider] = useState(false);
    const [slides, setSlides] = useState({
        slide1: { title: '', description: '' },
        slide2: { title: '', description: '' },
        slide3: { title: '', description: '' },
        slide4: { title: '', description: '' },
        slide5: { title: '', description: '' },
        slide6: { title: '', description: '' },
        slide7: { title: '', description: '' },
        slide8: { title: '', description: '' },
        slide9: { title: '', description: '' },
        slide10: { title: '', description: '' }
    });
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfFile, setPdfFile] = useState(null); // Store PDF file data
    const [contentType, setContentType] = useState('slides'); // 'slides' or 'pdf'
    const [isRefreshingThemes, setIsRefreshingThemes] = useState(false);
    const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);
    const [isRefreshingTileTemplates, setIsRefreshingTileTemplates] = useState(false);

    // ✅ Comprehensive function to load all required data for the form
    const fetchAllFormData = async () => {
        try {
            // Load sectors if not already loaded
            if (fetchSectors && sectorsData.data.length === 0) {
                await fetchSectors();
            }
            
            // Load sub-sectors if not already loaded
            if (fetchSubSectors && subSectorsData.data.length === 0) {
                await fetchSubSectors();
            }
            
            // Load signals if not already loaded
            if (fetchSignals && signalsData.data.length === 0) {
                await fetchSignals();
            }
            
            // Load sub-signals if not already loaded
            if (fetchSubSignals && subSignalsData.data.length === 0) {
                await fetchSubSignals();
            }
            
            // Load themes if not already loaded
            if (!allThemes || allThemes.length === 0) {
                await fetchAllThemes();
            }
            
            // Load posts if not already loaded
            if (!posts || posts.length === 0) {
                await fetchAllPosts();
            }
            
            // Load tile templates if not already loaded
            if (fetchTileTemplates && (!tileTemplates || tileTemplates.length === 0)) {
                await fetchTileTemplates();
            }
        } catch (err) {
            console.error("Error loading form data:", err);
        }
    };

    const fetchAllPosts = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setPosts(response.data.posts); // ✅ Store posts locally inside ContextForm
            }
        } catch (err) {
            console.error("Error fetching all posts:", err);
        }
    };


    // ✅ Load all form data when component mounts
    useEffect(() => {
        fetchAllFormData();
    }, [fetchAllFormData]);

    useEffect(() => {
        const editId = editIdFromQuery || contexts.editId;
        
        if (!editId) {
            // Clear form when not editing
            setContextTitle('');
            setDate('');
            setContainerType('Type-One');
            setIsTrending(false);
            setDisplayOrder(0);
            setSelectedSectors([]);
            setSelectedSubSectors([]);
            setSelectedSignalCategories([]);
            setSelectedSignalSubCategories([]);
            setSelectedThemes([]);
            setSelectedTileTemplates([]);
            setSelectedPosts([]);
            setBannerShow(false);
            setHomePageShow(false);
            setDoNotPublish(false);
            setBannerImage('');
            setOtherImage('');
            setDataForTypeNum('');
            setSummary('');
            setHasSlider(false);
            setSlides({
                slide1: { title: '', description: '' },
                slide2: { title: '', description: '' },
                slide3: { title: '', description: '' },
                slide4: { title: '', description: '' },
                slide5: { title: '', description: '' },
                slide6: { title: '', description: '' },
                slide7: { title: '', description: '' },
                slide8: { title: '', description: '' },
                slide9: { title: '', description: '' },
                slide10: { title: '', description: '' }
            });
            setPdfUrl('');
            setPdfFile(null);
            setContentType('slides');
            return;
        }

        // Wait for contexts.data to be available
        if (!Array.isArray(contexts.data) || contexts.data.length === 0) {
            return;
        }

        const context = contexts.data.find((ele) => ele._id === editId);
        if (context) {
            setContextTitle(context.contextTitle || '');
            setDate(context.date ? new Date(context.date).toISOString().substring(0, 10) : '');
            setContainerType(context.containerType || 'Type-One');
            setIsTrending(context.isTrending || false);
            setDisplayOrder(context.displayOrder || 0);
            setSelectedSectors(context.sectors || []);
            setSelectedSubSectors(context.subSectors || []);
            setSelectedSignalCategories(context.signalCategories || []);
            setSelectedSignalSubCategories(context.signalSubCategories || []);
            setSelectedThemes(
                (context.themes || []).map(themeId => {
                    const matchedTheme = (allThemes || []).find(theme => theme._id === themeId);
                    return {
                        value: themeId,
                        label: matchedTheme ? matchedTheme.themeTitle : 'Unknown Theme'
                    };
                })
            );
            setSelectedTileTemplates(
                (context.tileTemplates || []).map(templateId => {
                    const matchedTemplate = (tileTemplates || []).find(template => template._id === templateId);
                    return {
                        value: templateId,
                        label: matchedTemplate ? matchedTemplate.name : 'Unknown Template'
                    };
                })
            );
            // Handle posts - if posts are not loaded yet, store the post IDs and update later
            if (Array.isArray(posts) && posts.length > 0) {
                setSelectedPosts(
                    (context.posts || [])
                        .map(post => {
                            const matchedPost = posts.find(p => p._id === post.postId);
                            return matchedPost
                                ? { value: matchedPost._id, label: matchedPost.postTitle }
                                : null;
                        })
                        .filter(Boolean)
                );
            } else {
                // If posts are not loaded yet, store the post IDs for later processing
                setSelectedPosts(
                    (context.posts || []).map(post => ({
                        value: post.postId,
                        label: `Loading... (${post.postId})`
                    }))
                );
            }
            setBannerShow(context.bannerShow || false);
            setHomePageShow(context.homePageShow || false);
            setDoNotPublish(context.doNotPublish || false);
            setBannerImage(context.bannerImage || '');
            setOtherImage(context.otherImage || '');
            setDataForTypeNum(context.dataForTypeNum || '');
            setImageUrl(context.imageUrl || '');
            setSummary(context.summary || '');
            setHasSlider(context.hasSlider || false);
            setSlides({
                slide1: context.slide1 || { title: '', description: '' },
                slide2: context.slide2 || { title: '', description: '' },
                slide3: context.slide3 || { title: '', description: '' },
                slide4: context.slide4 || { title: '', description: '' },
                slide5: context.slide5 || { title: '', description: '' },
                slide6: context.slide6 || { title: '', description: '' },
                slide7: context.slide7 || { title: '', description: '' },
                slide8: context.slide8 || { title: '', description: '' },
                slide9: context.slide9 || { title: '', description: '' },
                slide10: context.slide10 || { title: '', description: '' }
            });
            setPdfUrl(context.pdfUrl || '');
            setPdfFile(context.pdfFile || null);
            // Determine content type based on existing data
            setContentType((context.pdfUrl || context.pdfFile) ? 'pdf' : 'slides');
        }
    }, [editIdFromQuery, contexts.editId, contexts.data, posts, allThemes, tileTemplates]);

    // ✅ Safe filtering with null/undefined checks
    const filteredSubSectors = (subSectorsData?.data || []).filter(subSector =>
        selectedSectors.includes(subSector.sectorId)
    );

    const filteredSignalSubCategories = (subSignalsData?.data || []).filter(subSignal =>
        selectedSignalCategories.includes(subSignal.signalId)
    );

    // Update selectedPosts when posts change
    useEffect(() => {
        if (!Array.isArray(posts) || posts.length === 0) return;
        
        // Get the current context being edited
        const editId = editIdFromQuery || contexts.editId;
        if (!editId) return;
        
        const context = contexts.data.find((ele) => ele._id === editId);
        if (!context) return;
        
        // Update selectedPosts with proper post titles
        setSelectedPosts(
            (context.posts || [])
                .map(post => {
                    const matchedPost = posts.find(p => p._id === post.postId);
                    return matchedPost
                        ? { value: matchedPost._id, label: matchedPost.postTitle }
                        : null;
                })
                .filter(Boolean)
        );
    }, [posts, editIdFromQuery, contexts.editId, contexts.data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
         
        // ✅ Check Required Fields Before Submitting
    if (!contextTitle.trim()) {
        toast.warn("⚠️ Context Title is required.");
        return;
    }

    if (!date) {
        toast.warn("⚠️ Date is required.");
        return;
    }

    if (!containerType) {
        toast.warn("⚠️ Container Type is required.");
        return;
    }

    // ✅ Add validation for required Sectors
    if (!selectedSectors || selectedSectors.length === 0) {
        toast.warn("⚠️ At least one Sector is required.");
        return;
    }

    // ✅ Add validation for required Signal Categories  
    if (!selectedSignalCategories || selectedSignalCategories.length === 0) {
        toast.warn("⚠️ At least one Signal Category is required.");
        return;
    }

        try {
            
            const updatedPosts = selectedPosts.length > 0 
                ? selectedPosts.map(post => ({
                    postId: post.value,
                    includeInContainer: post.includeInContainer || false, 
                }))
                : []; // Ensures an empty array if no posts are selected

            // ✅ Step 1: Safely fetch existing contexts tagged to each selected post
            const existingContextUpdates = selectedPosts.length > 0 ? await Promise.all(
                selectedPosts.map(async (post) => {
                    try {
                        const postId = post.value;
                        const response = await axios.get(`/api/admin/posts/${postId}/contexts`, {
                            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                        });
                        return response.data || []; // tagged contexts for the post
                    } catch (error) {
                        console.error(`Error fetching contexts for post ${post.value}:`, error);
                        return []; // Return empty array on error
                    }
                })
            ) : [];
            // ✅ Step 2: Safely update contexts with merged posts
            try {
                for (const taggedContexts of existingContextUpdates) {
                    if (Array.isArray(taggedContexts)) {
                        for (const taggedContext of taggedContexts) {
                            try {
                                // Merge existing posts with new selected posts
                                const existingPosts = taggedContext.posts || [];
                                const mergedPosts = [...existingPosts, ...updatedPosts];
        
                                // Remove duplicates
                                const uniquePosts = Array.from(
                                    new Map(mergedPosts.map(post => [post.postId, post])).values()
                                );
        
                                // Update the context with the new list of posts
                                await axios.put(`/api/admin/contexts/${taggedContext._id}`, {
                                    posts: uniquePosts,
                                }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                            } catch (contextUpdateError) {
                                console.error(`Error updating context ${taggedContext._id}:`, contextUpdateError);
                                // Continue with other contexts even if one fails
                            }
                        }
                    }
                }
            } catch (step2Error) {
                console.error("Error in Step 2:", step2Error);
                // Don't let Step 2 errors break the main context save
            }
    
            // Step 3: Save or update the current context
            const formData = {
                contextTitle,
                date,
                containerType,
                isTrending,
                displayOrder,
                sectors: selectedSectors,
                subSectors: selectedSubSectors,
                signalCategories: selectedSignalCategories,
                signalSubCategories: selectedSignalSubCategories,
                // ✅ Safe mapping for themes - handle case where theme.value might be undefined
                themes: selectedThemes && Array.isArray(selectedThemes) 
                    ? selectedThemes.map(theme => theme?.value).filter(Boolean)
                    : [],
                // ✅ Safe mapping for tile templates
                tileTemplates: selectedTileTemplates && Array.isArray(selectedTileTemplates) 
                    ? selectedTileTemplates.map(template => template?.value).filter(Boolean)
                    : [],
                posts: updatedPosts,
                bannerShow,
                homePageShow,
                doNotPublish,
                bannerImage,
                otherImage,
                dataForTypeNum,
                imageUrl,
                pdfUrl: contentType === 'pdf' ? pdfUrl : '',
                pdfFile: contentType === 'pdf' ? pdfFile : null,
                summary,
                hasSlider,
                slide1: contentType === 'slides' ? slides.slide1 : { title: '', description: '' },
                slide2: contentType === 'slides' ? slides.slide2 : { title: '', description: '' },
                slide3: contentType === 'slides' ? slides.slide3 : { title: '', description: '' },
                slide4: contentType === 'slides' ? slides.slide4 : { title: '', description: '' },
                slide5: contentType === 'slides' ? slides.slide5 : { title: '', description: '' },
                slide6: contentType === 'slides' ? slides.slide6 : { title: '', description: '' },
                slide7: contentType === 'slides' ? slides.slide7 : { title: '', description: '' },
                slide8: contentType === 'slides' ? slides.slide8 : { title: '', description: '' },
                slide9: contentType === 'slides' ? slides.slide9 : { title: '', description: '' },
                slide10: contentType === 'slides' ? slides.slide10 : { title: '', description: '' },
            };
            if (contexts.editId) {
                const response = await axios.put(`/api/admin/contexts/${contexts.editId}`, formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                });
                try {
                    contextsDispatch({ type: 'UPDATE_CONTEXT', payload: response.data });
                } catch (dispatchError) {
                    console.error("Error in contextsDispatch:", dispatchError);
                }
                
                try {
                    handleFormSubmit('Context updated successfully');
                } catch (formSubmitError) {
                    console.error("Error in handleFormSubmit:", formSubmitError);
                }
                
                toast.success("✅ Context updated successfully!");
                
                try {
                    if (fetchPosts && typeof fetchPosts === 'function') {
                        await fetchPosts();
                    } else {
                        console.warn("fetchPosts is not available or not a function");
                    }
                } catch (fetchError) {
                    console.error("Error in fetchPosts:", fetchError);
                    // Don't let fetchPosts error break the success flow
                }
            } else {
                const response = await axios.post('/api/admin/contexts', formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                });
                try {
                    contextsDispatch({ type: 'ADD_CONTEXT', payload: response.data });
                } catch (dispatchError) {
                    console.error("Error in contextsDispatch:", dispatchError);
                }
                
                try {
                    handleFormSubmit('Context added successfully');
                } catch (formSubmitError) {
                    console.error("Error in handleFormSubmit:", formSubmitError);
                }
                
                toast.success("✅ Context added successfully!");
                
                try {
                    if (fetchPosts && typeof fetchPosts === 'function') {
                        await fetchPosts();
                    } else {
                        console.warn("fetchPosts is not available or not a function");
                    }
                } catch (fetchError) {
                    console.error("Error in fetchPosts:", fetchError);
                    // Don't let fetchPosts error break the success flow
                }
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('An error occurred while submitting the form.');
        }
    };

    const containerTypeOptions = [
        { value: 'Type-One', label: 'Type-One' },
        { value: 'Type-Two', label: 'Type-Two' },
        { value: 'Type-Three', label: 'Type-Three' },
        { value: 'Type-Four', label: 'Type-Four' },
        { value: 'Type-Five', label: 'Type-Five' },
        { value: 'Type-Num', label: 'Type-Num' },
    ];


    const handleSlideChange = (slideNumber, field, value) => {
        setSlides(prevSlides => ({
            ...prevSlides,
            [slideNumber]: {
                ...prevSlides[slideNumber],
                [field]: value
            }
        }));
    };

    // Function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Convert themesData into a format suitable for react-select
    // const themeOptions = themesData.data.map(theme => ({
    //     value: theme._id,
    //     label: theme.themeTitle
    // }));
    // ✅ Convert allThemes into a format suitable for react-select with safe mapping
const themeOptions = (allThemes || []).map(theme => ({
    value: theme._id,
    label: theme.themeTitle
}));

// ✅ Convert tileTemplates into a format suitable for react-select with safe mapping
const tileTemplateOptions = (tileTemplates || []).map(template => ({
    value: template._id,
    label: template.name
}));

// ✅ Process `postOptions` AFTER `posts` state updates
useEffect(() => {
    if (Array.isArray(posts) && posts.length > 0) {
        setPostOptions(posts.map(post => ({
            value: post._id, 
            label: post.postTitle || "Untitled Post",
            key: post._id // ✅ Ensure each item has a unique key
        })));
        
    } else {
        setPostOptions([]); // ✅ Ensure an empty array if no posts
    }
}, [posts]); // ✅ Runs only when `posts` state updates

    // Custom MultiValueLabel for react-select to make selected themes clickable
    const MultiValueLabel = (props) => {
        const handleClick = (e) => {
            e.stopPropagation();
            window.open(`/admin/themes?editId=${props.data.value}`, '_blank');
        };
        return (
            <div
                style={{ cursor: 'pointer', textDecoration: 'underline', color: '#3b82f6' }}
                onClick={handleClick}
            >
                {props.children}
            </div>
        );
    };

    // Custom MultiValueLabel for react-select to make selected posts clickable
    const PostMultiValueLabel = (props) => {
        const handleClick = (e) => {
            e.stopPropagation();
            window.open(`/posts?editId=${props.data.value}`, '_blank');
        };
        return (
            <div
                style={{ cursor: 'pointer', textDecoration: 'underline', color: '#3b82f6' }}
                onClick={handleClick}
            >
                {props.children}
            </div>
        );
    };

    // Custom MultiValueLabel for react-select to make selected tile templates clickable
    const TileTemplateMultiValueLabel = (props) => {
        const handleClick = (e) => {
            e.stopPropagation();
            window.open(`/tile-templates/edit/${props.data.value}`, '_blank');
        };
        return (
            <div
                style={{ cursor: 'pointer', textDecoration: 'underline', color: '#3b82f6' }}
                onClick={handleClick}
            >
                {props.children}
            </div>
        );
    };

    return (
        <div className="context-form-outer">
            <div className="context-form-container">
                <button
                    type="button"
                    className="home-btn"
                    onClick={() => setIsFormVisible(false)}
                >
                    <span>←</span> Context Home
                </button>
                
                <form onSubmit={handleSubmit} className="context-form">
                    <div className="form-section">
                        <h2 className="form-section-title">Basic Information</h2>
                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="contextTitle">Context Title <span style={{color: 'red'}}>*</span></label>
                                <input name="entercontexttitle" id="contextTitle"
                                    type="text"
                                    placeholder="Enter context title"
                                    value={contextTitle}
                                    onChange={(e) => setContextTitle(e.target.value)}
                                    className="context-input"
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="date">Date <span style={{color: 'red'}}>*</span></label>
                                <input name="date" id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="context-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="containerType">Container Type <span style={{color: 'red'}}>*</span></label>
                                <Select name="select" id="containerType"
                                    options={containerTypeOptions}
                                    value={containerTypeOptions.find(option => option.value === containerType)}
                                    onChange={(selectedOption) => setContainerType(selectedOption.value)}
                                    className="context-select"
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    menuShouldScrollIntoView={false}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="displayOrder">Display Order</label>
                                <input
                                    id="displayOrder"
                                    type="number"
                                    placeholder="Enter display order"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                    className="context-input"
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div className="checkbox-container">
                                <input name="checkboxField" id="isTrending"
                                    type="checkbox"
                                    checked={isTrending}
                                    onChange={(e) => setIsTrending(e.target.checked)}
                                    className="context-checkbox"
                                />
                                <label htmlFor="isTrending" className="checkbox-label">Is Trending?</label>
                            </div>
                            <div className="toggle-container">
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
                        </div>
                    </div>

                    <div className="form-section">
                        <h2 className="form-section-title">Categories & Themes</h2>
                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="sectors">Sectors <span style={{color: 'red'}}>*</span></label>
                                <Select name="select" id="sectors"
                                    isMulti
                                    options={(sectorsData?.data || []).map(sector => ({ value: sector._id, label: sector.sectorName }))}
                                    value={selectedSectors.map(sectorId => ({ value: sectorId, label: (sectorsData?.data || []).find(sector => sector._id === sectorId)?.sectorName || '' }))}
                                    onChange={(selectedOptions) => setSelectedSectors((selectedOptions || []).map(option => option.value))}
                                    className="context-select"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="subSectors">Sub-Sectors</label>
                                <Select name="select" id="subSectors"
                                    isMulti
                                    options={filteredSubSectors.map(subSector => ({
                                        value: subSector._id,
                                        label: subSector.subSectorName
                                    }))}
                                    value={selectedSubSectors.map(subSectorId => ({
                                        value: subSectorId,
                                        label: (subSectorsData?.data || []).find(subSector => subSector._id === subSectorId)?.subSectorName || ''
                                    }))}
                                    onChange={(selectedOptions) => setSelectedSubSectors((selectedOptions || []).map(option => option.value))}
                                    className="context-select"
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="signalCategories">Signal Categories <span style={{color: 'red'}}>*</span></label>
                                <Select name="select" id="signalCategories"
                                    isMulti
                                    options={(signalsData?.data || []).map(signal => ({
                                        value: signal._id,
                                        label: signal.signalName
                                    }))}
                                    value={selectedSignalCategories.map(signalId => ({
                                        value: signalId,
                                        label: (signalsData?.data || []).find(signal => signal._id === signalId)?.signalName || ''
                                    }))}
                                    onChange={(selectedOptions) => setSelectedSignalCategories((selectedOptions || []).map(option => option.value))}
                                    className="context-select"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="signalSubCategories">Signal Sub-Categories</label>
                                <Select name="select" id="signalSubCategories"
                                    isMulti
                                    options={filteredSignalSubCategories.map(subSignal => ({
                                        value: subSignal._id,
                                        label: subSignal.subSignalName
                                    }))}
                                    value={selectedSignalSubCategories.map(subSignalId => ({
                                        value: subSignalId,
                                        label: (subSignalsData?.data || []).find(subSignal => subSignal._id === subSignalId)?.subSignalName || ''
                                    }))}
                                    onChange={(selectedOptions) => setSelectedSignalSubCategories((selectedOptions || []).map(option => option.value))}
                                    className="context-select"
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="themes">Themes</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Select name="select" id="themes"
                                        isMulti
                                        options={themeOptions}
                                        value={selectedThemes}
                                        onChange={setSelectedThemes}
                                        className="context-select"
                                        components={{ MultiValueLabel }}
                                    />
                                    <button
                                        type="button"
                                        className="refresh-btn"
                                        title="Refresh themes"
                                        onClick={async () => {
                                            setIsRefreshingThemes(true);
                                            try {
                                                await fetchAllThemes();
                                                setSelectedThemes([]);
                                            } finally {
                                                setIsRefreshingThemes(false);
                                            }
                                        }}
                                        disabled={isRefreshingThemes}
                                    >
                                        {isRefreshingThemes ? (
                                            <span className="spin">⏳</span>
                                        ) : (
                                            <span>↻</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="tileTemplates">Tile Templates</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Select name="select" id="tileTemplates"
                                        isMulti
                                        options={tileTemplateOptions}
                                        value={selectedTileTemplates}
                                        onChange={setSelectedTileTemplates}
                                        className="context-select"
                                        components={{ MultiValueLabel: TileTemplateMultiValueLabel }}
                                        placeholder="Select tile templates..."
                                    />
                                    <button
                                        type="button"
                                        className="refresh-btn"
                                        title="Refresh tile templates"
                                        onClick={async () => {
                                            setIsRefreshingTileTemplates(true);
                                            try {
                                                await fetchTileTemplates();
                                                setSelectedTileTemplates([]);
                                            } finally {
                                                setIsRefreshingTileTemplates(false);
                                            }
                                        }}
                                        disabled={isRefreshingTileTemplates}
                                    >
                                        {isRefreshingTileTemplates ? (
                                            <span className="spin">⏳</span>
                                        ) : (
                                            <span>↻</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2 className="form-section-title">Posts & Content</h2>
                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="posts">Posts</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Select name="select" id="posts"
                                        isMulti
                                        options={postOptions}
                                        value={selectedPosts}
                                        onChange={setSelectedPosts}
                                        className="post-select"
                                        components={{ MultiValueLabel: PostMultiValueLabel }}
                                    />
                                    <button
                                        type="button"
                                        className="refresh-btn"
                                        title="Refresh posts"
                                        onClick={async () => {
                                            setIsRefreshingPosts(true);
                                            try {
                                                await fetchAllPosts();
                                                setSelectedPosts([]);
                                            } finally {
                                                setIsRefreshingPosts(false);
                                            }
                                        }}
                                        disabled={isRefreshingPosts}
                                    >
                                        {isRefreshingPosts ? (
                                            <span className="spin">⏳</span>
                                        ) : (
                                            <span>↻</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="field-group">
                            <div className="checkbox-container">
                                <input name="checkboxField" id="bannerShow"
                                    type="checkbox"
                                    checked={bannerShow}
                                    onChange={(e) => setBannerShow(e.target.checked)}
                                    className="context-checkbox"
                                />
                                <label htmlFor="bannerShow" className="checkbox-label">Show Banner?</label>
                            </div>
                            <div className="checkbox-container">
                                <input name="checkboxField" id="homePageShow"
                                    type="checkbox"
                                    checked={homePageShow}
                                    onChange={(e) => setHomePageShow(e.target.checked)}
                                    className="context-checkbox"
                                />
                                <label htmlFor="homePageShow" className="checkbox-label">Show on Homepage?</label>
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="bannerImage">Banner Image URL</label>
                                <input name="enterbannerimageurl" id="bannerImage"
                                    type="text"
                                    placeholder="Enter banner image URL"
                                    value={bannerImage}
                                    onChange={(e) => setBannerImage(e.target.value)}
                                    className="context-input"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="otherImage">Other Image URL</label>
                                <input name="enterotherimageurl" id="otherImage"
                                    type="text"
                                    placeholder="Enter other image URL"
                                    value={otherImage}
                                    onChange={(e) => setOtherImage(e.target.value)}
                                    className="context-input"
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                <ImageUpload
                    onImageUpload={(url) => {
                        setImageUrl(url);
                    }}
                    currentImageUrl={imageUrl}
                    onImageDelete={() => {
                        setImageUrl('');
                    }}
                    label="Context Image"
                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="dataForTypeNum">Data for Type-Num</label>
                                <input name="enterdatafortype-num" id="dataForTypeNum"
                                    type="text"
                                    placeholder="Enter data for Type-Num"
                                    value={dataForTypeNum}
                                    onChange={(e) => setDataForTypeNum(e.target.value)}
                                    className="context-input"
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div style={{ flex: 1 }}>
                                <label htmlFor="summary">Summary</label>
                                <Quill
                                    id="summary"
                                    value={summary}
                                    onChange={setSummary}
                                    theme="snow"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="hasSlider"><b>Enable Slider?</b></label>
                        <input name="checkboxField" id="hasSlider"
                            type="checkbox"
                            checked={hasSlider}
                            onChange={(e) => setHasSlider(e.target.checked)}
                            className="context-checkbox"
                        />
                    </div>

                    {hasSlider && (
                        <div className="slider-section">
                            <h3>Slider Content</h3>
                            
                            {/* Content Type Selection */}
                            <div className="field-group">
                                <div style={{ flex: 1 }}>
                                    <label><b>Choose Content Type:</b></label>
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="contentType"
                                                value="slides"
                                                checked={contentType === 'slides'}
                                                onChange={(e) => setContentType(e.target.value)}
                                            />
                                            <span>Individual Slide Content (Title & Description)</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="contentType"
                                                value="pdf"
                                                checked={contentType === 'pdf'}
                                                onChange={(e) => setContentType(e.target.value)}
                                            />
                                            <span>Upload Complete PDF Document</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Content Based on Selection */}
                            {contentType === 'pdf' ? (
                                /* PDF Upload Section */
                                <div className="field-group">
                                    <div style={{ flex: 1 }}>
                                        <label><b>Upload Complete Document (PDF)</b></label>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                            Maximum file size: 25MB
                                        </div>
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={async (e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (!file) return;
                                                
                                                // Check file size (limit to 25MB to stay well under 50MB server limit)
                                                const maxSize = 25 * 1024 * 1024; // 25MB in bytes
                                                if (file.size > maxSize) {
                                                    toast.error(`File size too large. Maximum allowed size is 25MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
                                                    e.target.value = ''; // Clear the input
                                                    return;
                                                }
                                                
                                                try {
                                                    // Convert file to base64
                                                    const base64Data = await fileToBase64(file);
                                                    
                                                    // Create file data object
                                                    const fileData = {
                                                        data: base64Data,
                                                        contentType: file.type,
                                                        fileName: file.name,
                                                        fileSize: file.size
                                                    };
                                                    
                                                    setPdfFile(fileData);
                                                    setPdfUrl(''); // Clear old URL if any
                                                    toast.success('✅ PDF file ready for upload!');
                                                } catch (err) {
                                                    console.error('PDF file processing failed', err);
                                                    toast.error('Failed to process PDF file');
                                                }
                                            }}
                                            style={{ marginBottom: '10px' }}
                                        />
                                        {pdfFile ? (
                                            <div style={{ marginTop: 6 }}>
                                                <div style={{ color: '#059669', fontSize: '14px', marginBottom: '8px' }}>
                                                    📄 File: {pdfFile.fileName} ({(pdfFile.fileSize / 1024 / 1024).toFixed(2)} MB)
                                                </div>
                                                <a 
                                                    href={`/api/admin/contexts/${contexts.editId || editIdFromQuery}/pdf`}
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '14px' }}
                                                >
                                                    📥 Download PDF File
                                                </a>
                                            </div>
                                        ) : pdfUrl ? (
                                            <div style={{ marginTop: 6 }}>
                                                <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                                    📄 View Uploaded Document
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                /* Individual Slides Section */
                                <div className="slides-container">
                                    {[...Array(10)].map((_, index) => {
                                        const slideNumber = `slide${index + 1}`;
                                        return (
                                            <div key={slideNumber} className="slide">
                                                <label htmlFor={`${slideNumber}Title`}><b>Slide {index + 1} Title</b></label>
                                                <input name="textField" id={`${slideNumber}Title`}
                                                    type="text"
                                                    placeholder={`Slide ${index + 1} Title`}
                                                    value={slides[slideNumber]?.title || ''}
                                                    onChange={(e) => handleSlideChange(slideNumber, 'title', e.target.value)}
                                                    className="context-input"
                                                />
                                                <label htmlFor={`${slideNumber}Description`}><b>Slide {index + 1} Description</b></label>
                                                <Quill
                                                    id={`${slideNumber}Description`}
                                                    value={slides[slideNumber]?.description || ''}
                                                    onChange={(value) => handleSlideChange(slideNumber, 'description', value)}
                                                    theme="snow"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" className="submit-btn">Save Context</button>
                </form>
            </div>
        </div>
    );
}
