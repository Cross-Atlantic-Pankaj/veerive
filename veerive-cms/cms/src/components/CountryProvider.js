import React, { useReducer, useEffect, useState, useContext } from 'react'; // Import necessary React hooks
import axios from '../config/axios'; // Import axios instance for API requests
import CountryContext from '../context/CountryContext'; // Import CountryContext for managing country-related state
import RegionContext from '../context/RegionContext'; // Import RegionContext for managing region-related state

// Reducer function to manage country-related state updates
const countryReducer = (state, action) => {
    switch (action.type) {
        case 'SET_COUNTRIES': // Action type for setting the list of countries
            return { ...state, data: action.payload }; // Update state with the list of countries
        case 'ADD_COUNTRY': // Action type for adding a new country
            return { ...state, data: [...state.data, action.payload] }; // Add new country to the list
        case 'REMOVE_COUNTRY': // Action type for removing a country
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) }; // Remove country from the list
        case 'SET_EDIT_ID': // Action type for setting the ID of the country being edited
            return { ...state, editId: action.payload }; // Set edit ID in state
        case 'UPDATE_COUNTRY': // Action type for updating an existing country
            return {
                ...state,
                editId: null, // Clear the edit ID after update
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele // Update country in the list
                ),
            };
        default:
            return state; // Return the current state if no matching action type is found
    }
};

// ContextProvider component for managing and providing country-related state to child components
export const CountryProvider = ({ children }) => {
    // Initialize state and dispatch for managing countries using useReducer
    const [countries, countriesDispatch] = useReducer(countryReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(false); // State for controlling the visibility of the form
    const [successMessage, setSuccessMessage] = useState(''); // State for storing success messages

    const { regions } = useContext(RegionContext); // Access region data from RegionContext

    // useEffect hook to fetch country data when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Make API call to fetch countries
    //             const response = await axios.get('/api/admin/countries', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
    //             // Dispatch action to update state with the fetched countries
    //             countriesDispatch({ type: 'SET_COUNTRIES', payload: response.data });
    //         } catch (err) {
    //             // Log any errors that occur during the API call
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once when the component mounts

    // ✅ Fetch function available for manual loading
    const fetchCountries = async () => {
        try {
            const response = await axios.get('/api/admin/countries', { 
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            countriesDispatch({ type: 'SET_COUNTRIES', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Countries:", err);
        }
    };

    // ✅ DISABLED - Only load when Country page is accessed
    // useEffect(() => {
    //     if (regions?.data?.length > 0) {
    //         fetchCountries();
    //     }
    // }, [regions]);
    
    // useEffect(() => {
    //     console.log("✅ Available Regions in CountryProvider:", regions?.data);
    // }, [regions]);

    // Handler function for clicking the "Add" button
    const handleAddClick = () => {
        // Dispatch action to clear the edit ID
        countriesDispatch({ type: 'SET_EDIT_ID', payload: null });
        // Show the form for adding a new country
        setIsFormVisible(true);
    };

    // Handler function for clicking the "Edit" button
    const handleEditClick = (id) => {
        // Dispatch action to set the edit ID for the country being edited
        countriesDispatch({ type: 'SET_EDIT_ID', payload: id });
        // Show the form for editing the selected country
        setIsFormVisible(true);
    };

    // Handler function for form submission
    const handleFormSubmit = (message) => {
        // Hide the form after submission
        setIsFormVisible(false);
        // Set the success message to be displayed
        setSuccessMessage(message);
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide country-related state and functions to child components through CountryContext
    return (
        <CountryContext.Provider value={{ countries, countriesDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchCountries }}>
            {successMessage && ( // ✅ Display message only when it's set
            <div className="success-message" style={{ background: "green", color: "white", padding: "8px", textAlign: "center", marginBottom: "10px" }}>
                {successMessage}
            </div>
        )}
            {children} 
        </CountryContext.Provider>
    );
};
