import React, { useReducer, useState, useEffect, useContext, useRef } from 'react';
import axios from '../config/axios';
import ThemeContext from '../context/ThemeContext';
import SectorContext from '../context/SectorContext';
import SubSectorContext from '../context/SubSectorContext';

// Reducer function to manage theme state updates
const themeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_THEMES':
            return { 
                ...state, 
                data: action.payload.themes, 
                totalPages: action.payload.totalPages || 1,
                currentPage: action.payload.currentPage || state.currentPage
            };
        case 'ADD_THEME':
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_THEME':
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            return { ...state, editId: action.payload };
        case 'UPDATE_THEME':
            return {
                ...state,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        case 'SET_ALL_THEMES':
            return {
                ...state,
                allThemes: action.payload
            };
        default:
            return state;
    }
};

// ✅ ThemeProvider Component
export const ThemeProvider = ({ children }) => {
    const [themes, themesDispatch] = useReducer(themeReducer, { 
        data: [], 
        editId: null, 
        totalPages: 1, 
        currentPage: 1,
        allThemes: [] 
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const hasFetched = useRef(false);

    const [currentPage, setCurrentPage] = useState(() => {
        return parseInt(localStorage.getItem("currentPage")) || 1;
    });

    const { sectors, fetchSectors } = useContext(SectorContext);
    const { subSectors, fetchSubSectors } = useContext(SubSectorContext);

    // ✅ Fetch ALL themes (for search) only once
    const fetchAllThemes = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`/api/admin/themes/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            themesDispatch({ type: 'SET_ALL_THEMES', payload: response.data.themes });
        } catch (err) {
            console.error("❌ Error Fetching All Themes:", err);
        }
    };

    // ✅ Fetch all required data for themes page (themes, sectors, sub-sectors)
    const fetchThemesPageData = async () => {
        try {
            // Fetch themes data
            await fetchAllThemes();
            
            // Fetch sectors data if not already loaded
            if (fetchSectors && sectors.data.length === 0) {
                await fetchSectors();
            }
            
            // Fetch sub-sectors data if not already loaded
            if (fetchSubSectors && subSectors.data.length === 0) {
                await fetchSubSectors();
            }
        } catch (err) {
            console.error("❌ Error Fetching Themes Page Data:", err);
        }
    };

    // ✅ Fetch Themes only if token is present
    const fetchThemes = async (page, limit = 10) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/themes?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let totalPages = response.data.totalPages || 1;
    
            themesDispatch({
                type: 'SET_THEMES',
                payload: { 
                    ...response.data, 
                    currentPage: page,
                    totalPages
                }
            });

            if (localStorage.getItem("currentPage") !== String(page)) {
                localStorage.setItem("currentPage", page);
            }
        } catch (err) {
            console.error("❌ Error Fetching Themes:", err);
        }
    };

    // ✅ DISABLED - Only load when Theme page is accessed
    // useEffect(() => {
    //     if (!hasFetched.current) {
    //         hasFetched.current = true;
    //         fetchThemes(currentPage);
    //         fetchAllThemes();
    //     }
    // }, []);

    // ✅ Corrected `setCurrentPage` to update both local state and context
    const updateCurrentPage = (newPage) => {
        setCurrentPage(newPage);
        themesDispatch({ type: 'SET_PAGE', payload: newPage });
        fetchThemes(newPage);
    };

    // ✅ Handle Add Theme Click
    const handleAddClick = () => {
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // ✅ Handle Edit Theme Click
    const handleEditClick = async (id) => {
        try {
            // First fetch the specific theme to ensure we have the latest data
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`/api/admin/themes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the theme in the context
            themesDispatch({ 
                type: 'UPDATE_THEME', 
                payload: response.data 
            });

            // Set edit ID and show form
            themesDispatch({ type: 'SET_EDIT_ID', payload: id });
            setIsFormVisible(true);
        } catch (err) {
            console.error("❌ Error fetching theme for edit:", err);
        }
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = (message) => {
        // Clear edit state
        themesDispatch({ type: 'SET_EDIT_ID', payload: null });
        // Hide the form
        setIsFormVisible(false);
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 2000);
    };
    return (
        <ThemeContext.Provider 
            value={{ 
                themes, 
                fetchThemes,
                fetchAllThemes,
                fetchThemesPageData, 
                isFormVisible, 
                setIsFormVisible,
                themesDispatch, 
                handleAddClick, 
                handleEditClick, 
                handleFormSubmit, 
                sectors, 
                subSectors, 
                currentPage, 
                setCurrentPage: updateCurrentPage
            }}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {children} 
        </ThemeContext.Provider>
    );
};
