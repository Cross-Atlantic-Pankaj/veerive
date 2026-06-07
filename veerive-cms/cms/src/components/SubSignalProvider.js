import React, { useReducer, useEffect, useState } from 'react';
// Import React and hooks: useReducer for state management, useEffect for side effects, and useState for local state
import axios from '../config/axios';
// Import the configured axios instance for making HTTP requests
import SubSignalContext from '../context/SubSignalContext';
// Import the SubSignalContext to provide and consume sub-signal data

// Reducer function to manage sub-signal state updates
const subSignalReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SUBSIGNALS':
            // Set the entire list of sub-signals in the state from action.payload
            return { ...state, data: action.payload };
        case 'ADD_SUBSIGNAL':
            // Add a new sub-signal to the existing list in the state
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_SUBSIGNAL':
            // Remove a sub-signal based on its ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the sub-signal being edited in the state
            return { ...state, editId: action.payload };
        case 'UPDATE_SUBSIGNAL':
            // Update a specific sub-signal in the state with new data provided in action.payload
            return {
                ...state,
                editId: null, // Reset editId to null after updating
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            // Return the current state if no matching action type is found
            return state;
    }
};

// Provider component for managing sub-signal state and providing context
export const SubSignalProvider = ({ children }) => {
    // Initialize state and dispatch function using the subSignalReducer
    const [subSignals, subSignalsDispatch] = useReducer(subSignalReducer, { data: [], editId: null });
    // State for controlling the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // State for storing and displaying success messages
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect hook to fetch sub-signal data from the API when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Make an API request to get sub-signal data
    //             const response = await axios.get('/api/admin/sub-signals', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }});
    //             // Dispatch action to set the fetched sub-signal data in the state
    //             subSignalsDispatch({ type: 'SET_SUBSIGNALS', payload: response.data });
    //         } catch (err) {
    //             // Log any errors encountered during the fetch operation
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array ensures this effect runs only once on mount

    // ✅ Fetch function available for manual loading
    const fetchSubSignals = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.get('/api/admin/sub-signals', {
                headers: { Authorization: `Bearer ${token}` },
            });
            subSignalsDispatch({ type: 'SET_SUBSIGNALS', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Sub-Signals:", err);
        }
    };

    // ✅ DISABLED - Only load when SubSignal page is accessed
    // useEffect(() => {
    //     fetchSubSignals();
    // }, []); // Runs once on mount
    
    // Handler function to show the form and prepare for adding a new sub-signal
    const handleAddClick = () => {
        subSignalsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing sub-signal
    const handleEditClick = (id) => {
        subSignalsDispatch({ type: 'SET_EDIT_ID', payload: id });
        setIsFormVisible(true);
    };

    // Handler function to hide the form and display a success message
    const handleFormSubmit = (message) => {
        setIsFormVisible(false);
        setSuccessMessage(message);
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide context to child components
    return (
        <SubSignalContext.Provider value={{ subSignals, subSignalsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchSubSignals }}>
            {children} 
        </SubSignalContext.Provider>
    );
};
