import React, { useReducer, useEffect, useState, useContext } from 'react'; 
// Import React and hooks for state management, side effects, and context access
import axios from '../config/axios'; 
// Import the configured axios instance for making API requests
import SubSectorContext from '../context/SubSectorContext'; 
// Import the SubSectorContext to manage sub-sector data
import SectorContext from '../context/SectorContext'; 
// Import the SectorContext to access sector data

// Define the reducer function to handle state updates for sub-sectors
const subSectorReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SUB_SECTORS':
            // Update the state with the list of sub-sectors provided in action.payload
            return { ...state, data: action.payload };
        case 'ADD_SUB_SECTOR':
            // Add a new sub-sector to the existing list of sub-sectors
            return { ...state, data: [...state.data, action.payload] };
        case 'REMOVE_SUB_SECTOR':
            // Remove a sub-sector based on the ID provided in action.payload
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID':
            // Set the ID of the sub-sector being edited
            return { ...state, editId: action.payload };
        case 'UPDATE_SUB_SECTOR':
            // Update a specific sub-sector in the list with new data provided in action.payload
            return {
                ...state,
                editId: null, // Reset editId to null after update
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ),
            };
        default:
            // Return the current state if no recognized action type is provided
            return state;
    }
};

// Define the provider component for managing sub-sector state
export const SubSectorProvider = ({ children }) => {
    // Initialize state and dispatch function using the subSectorReducer
    const [subSectors, subSectorsDispatch] = useReducer(subSectorReducer, { data: [], editId: null });
    // Local state to manage the visibility of the form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Local state to manage success messages
    const [successMessage, setSuccessMessage] = useState('');

    // Access sector data from the SectorContext
    const { sectors } = useContext(SectorContext);

    // useEffect hook to fetch sub-sector data from the API when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Fetch sub-sector data from the API with authorization token
    //             const response = await axios.get('/api/admin/sub-sectors', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
    //             // Dispatch action to update sub-sectors state with fetched data
    //             subSectorsDispatch({ type: 'SET_SUB_SECTORS', payload: response.data });
    //         } catch (err) {
    //             // Log any errors that occur during the fetch operation
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once on component mount

    // ✅ Fetch function available for manual loading
    const fetchSubSectors = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.get('/api/admin/sub-sectors', {
                headers: { Authorization: `Bearer ${token}` },
            });
            subSectorsDispatch({ type: 'SET_SUB_SECTORS', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Sub-Sectors:", err);
        }
    };

    // ✅ DISABLED - Only load when SubSector page is accessed
    // useEffect(() => {
    //     fetchSubSectors();
    // }, []);
    
    // Handler function to show the form and prepare for adding a new sub-sector
    const handleAddClick = () => {
        subSectorsDispatch({ type: 'SET_EDIT_ID', payload: null });
        setIsFormVisible(true);
    };

    // Handler function to show the form and prepare for editing an existing sub-sector
    const handleEditClick = (id) => {
        subSectorsDispatch({ type: 'SET_EDIT_ID', payload: id });
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
        <SubSectorContext.Provider value={{ subSectors, subSectorsDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchSubSectors }}>
            {children} 
        </SubSectorContext.Provider>
    );
};
