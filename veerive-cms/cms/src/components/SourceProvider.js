import React, { useReducer, useState, useEffect } from 'react'; // Import React and hooks for state management and side effects
import axios from '../config/axios'; // Import the configured axios instance for making API requests
import SourceContext from '../context/SourceContext'; // Import the SourceContext to manage source data

// Define the reducer function to handle state updates for sources
const sourceReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SOURCES':
            // Update the state with the list of sources provided in action.payload
            return { ...state, data: action.payload };
        case 'ADD_SOURCE':
            // Add a new source to the existing list of sources
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_SOURCE':
            // Remove a source based on the ID provided in action.payload
            return { ...state, data: state.data.filter(source => source._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the source being edited
            return { ...state, editId: action.payload };
        case 'UPDATE_SOURCE':
            // Update a specific source in the list with new data provided in action.payload
            return {
                ...state,
                editId: null, // Reset editId to null after update
                data: state.data.map(source =>
                    source._id === action.payload._id ? { ...action.payload } : source
                ),
            };
        default:
            // Return the current state if no recognized action type is provided
            return state;
    }
};

// Define the provider component for managing source state
export const SourceProvider = ({ children }) => {
    // Initialize state and dispatch function using the sourceReducer
    const [sources, sourcesDispatch] = useReducer(sourceReducer, { data: [], editId: null });
    // Local state to manage the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Local state to manage success messages
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect hook to fetch sources data from the API when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Fetch sources data from the API with authorization token
    //             const response = await axios.get('/api/admin/sources', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
    //             // Dispatch action to update sources state with fetched data
    //             sourcesDispatch({ type: 'SET_SOURCES', payload: response.data });
    //         } catch (err) {
    //             // Log any errors that occur during the fetch operation
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once on component mount

    // ✅ Fetch function available for manual loading
    const fetchSources = async () => {
        const token = sessionStorage.getItem('token');  // ✅ Get token from localStorage
        if (!token) {
            return;  // ✅ Skip API call if no token is available
        }

        try {
            const response = await axios.get('/api/admin/sources', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            sourcesDispatch({ type: 'SET_SOURCES', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Sources:", err);
        }
    };

    // ✅ DISABLED - Only load when Source page is accessed
    // useEffect(() => {
    //     fetchSources();
    // }, []);
    
    // Handler function to show the form and prepare for adding a new source
    const handleAddClick = () => {
        sourcesDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing source
    const handleEditClick = (id) => {
        sourcesDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    // Handler function to hide the form and show a success message after form submission
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide context value to child components
    return (
        <SourceContext.Provider value={{ sources, sourcesDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchSources }}>
            {children} 
        </SourceContext.Provider>
    );
};
