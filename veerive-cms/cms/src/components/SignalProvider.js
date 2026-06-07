import React, { useReducer, useEffect, useState } from 'react'; // Import React and hooks for state management and side effects
import axios from '../config/axios'; // Import the axios instance configured for API requests
import SignalContext from '../context/SignalContext'; // Import the SignalContext for managing signal data

// Define the reducer function to handle state updates for signals
const signalReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SIGNALS':
            // Update the state with the list of signals provided in action.payload
            return { ...state, data: action.payload };
        case 'ADD_SIGNAL':
            // Add a new signal to the existing list of signals
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_SIGNAL':
            // Remove a signal based on the ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the signal being edited
            return { ...state, editId: action.payload };
        case 'UPDATE_SIGNAL':
            // Update a specific signal in the list with new data provided in action.payload
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            // Return the current state if no recognized action type is provided
            return state;
    }
};

// Define the provider component for managing signal state
export const SignalProvider = ({ children }) => {
    // Initialize state and dispatch function using the signalReducer
    const [signals, signalsDispatch] = useReducer(signalReducer, { data: [], editId: null });
    // Local state to manage the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Local state to manage success messages
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect hook to fetch signals data from the API when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Fetch signals data from the API with authorization token
    //             const response = await axios.get('/api/admin/signals', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
    //             // Dispatch action to update signals state with fetched data
    //             signalsDispatch({ type: 'SET_SIGNALS', payload: response.data });
    //         } catch (err) {
    //             // Log any errors that occur during the fetch operation
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once on component mount

    // ✅ Fetch function available for manual loading
    const fetchSignals = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.get('/api/admin/signals', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            signalsDispatch({ type: 'SET_SIGNALS', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Signals:", err);
        }
    };

    // ✅ DISABLED - Only load when Signal page is accessed
    // useEffect(() => {
    //     fetchSignals();
    // }, []);
    
    // Handler function to show the form and prepare for adding a new signal
    const handleAddClick = () => {
        signalsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing signal
    const handleEditClick = (id) => {
        signalsDispatch({ type: 'SET_EDIT_ID', payload: id });
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
        <SignalContext.Provider value={{ signals, signalsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchSignals }}>
            {children} 
        </SignalContext.Provider>
    );
};
