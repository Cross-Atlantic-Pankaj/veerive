import React, { useReducer, useState, useContext, useEffect } from 'react'; // Importing React and hooks for state management and side effects
import axios from '../config/axios'; // Importing axios instance for API calls
import CompanyContext from '../context/CompanyContext'; // Importing CompanyContext for managing company-related state
import CountryContext from '../context/CountryContext'; // Importing CountryContext for managing country-related state
import SectorContext from '../context/SectorContext'; // Importing SectorContext for managing sector-related state
import SubSectorContext from '../context/SubSectorContext'; // Importing SubSectorContext for managing sub-sector-related state

// Reducer function to handle company-related actions and state updates
const companyReducer = (state, action) => {
    switch (action.type) {
        case 'SET_COMPANIES': // Action type for setting the list of companies
            return { ...state, data: action.payload }; // Update state with new list of companies
        case 'ADD_COMPANY': // Action type for adding a new company
            return { ...state, data: [...state.data, action.payload] }; // Add the new company to the list
        case 'REMOVE_COMPANY': // Action type for removing a company
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) }; // Filter out the company to be removed
        case 'SET_EDIT_ID': // Action type for setting the ID of the company being edited
            return { ...state, editId: action.payload }; // Update editId in the state
        case 'UPDATE_COMPANY': // Action type for updating a company
            return {
                ...state,
                editId: null, // Clear the editId after updating
                data: state.data.map((ele) =>
                    ele._id === action.payload._id ? { ...action.payload } : ele
                ), // Update the company in the list
            };
        default:
            return state; // Return the current state if action type does not match
    }
};

// CompanyProvider component to manage company state and provide context
export const CompanyProvider = ({ children }) => {
    // Initialize state and dispatch for managing company-related actions
    const [companies, companiesDispatch] = useReducer(companyReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(false); // State to control the visibility of the form
    const [successMessage, setSuccessMessage] = useState(''); // State to store success messages

    // Retrieve country, sector, and sub-sector data from their respective contexts
    const { countries } = useContext(CountryContext);
    const { sectors } = useContext(SectorContext);
    const { subSectors } = useContext(SubSectorContext);

    // useEffect to fetch company data when the component mounts
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             // Make API call to fetch companies
    //             const response = await axios.get('/api/admin/companies', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
    //             // Dispatch action to update the state with the fetched companies
    //             companiesDispatch({ type: 'SET_COMPANIES', payload: response.data });
    //         } catch (err) {
    //             // Log error if the API call fails
    //             console.log(err);
    //         }
    //     })();
    // }, []); // Empty dependency array means this effect runs once on component mount

    // ✅ Fetch function available for manual loading
    const fetchCompanies = async () => {
        const token = sessionStorage.getItem('token'); // ✅ Check if token is stored
        if (!token) {
            return; // ✅ Skip fetch if no token is available
        }

        try {
            const response = await axios.get('/api/admin/companies', {
                headers: { Authorization: `Bearer ${token}` },
            });
            companiesDispatch({ type: 'SET_COMPANIES', payload: response.data });
        } catch (err) {
            console.error("❌ Error Fetching Companies:", err);
        }
    };

    // ✅ DISABLED - Only load when Company page is accessed
    // useEffect(() => {
    //     fetchCompanies();
    // }, []);

    // Function to handle the click event for adding a company
    const handleAddClick = () => {
        companiesDispatch({ type: 'SET_EDIT_ID', payload: null }); // Clear the edit ID
        setIsFormVisible(true); // Show the form for adding a new company
    };

    // Function to handle the click event for editing a company
    const handleEditClick = (id) => {
        companiesDispatch({ type: 'SET_EDIT_ID', payload: id }); // Set the edit ID for the company being edited
        setIsFormVisible(true); // Show the form for editing the company
    };

    // Function to handle form submission and display a success message
    const handleFormSubmit = (message) => {
        setIsFormVisible(false); // Hide the form after submission
        setSuccessMessage(message); // Set the success message
        // Clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Provide company-related state and functions to child components through context
    return (
        <CompanyContext.Provider value={{ companies, companiesDispatch, isFormVisible, setIsFormVisible, handleAddClick, handleEditClick, handleFormSubmit, fetchCompanies, countries, sectors, subSectors }}>
            {children} 
        </CompanyContext.Provider>
    );
};
