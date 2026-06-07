import React, { useContext } from 'react'; // Import React and hooks from React
import CompanyContext from '../../context/CompanyContext'; // Import CompanyContext for managing company-related state
import CompanyList from './CompanyList'; // Import the CompanyList component to display the list of companies
import CompanyForm from './CompanyForm'; // Import the CompanyForm component for adding/editing companies
import styles from '../../html/css/Company.module.css'; // Import CSS for styling the CompanyPage component

const CompanyPage = () => {
    // Use CompanyContext to access context values and functions
    const {  isFormVisible,  handleFormSubmit } = useContext(CompanyContext);

    return (
        <div className="companies-container"> {/* Container for the Companies page */}
{/* Conditional rendering based on form visibility */} 
{/* Render CompanyList component if the form is not visible */} 
{/* Render CompanyForm component if the form is visible */}
            {!isFormVisible ? (  
                <>
                    <CompanyList /> 
                </>
            ) : (
                <CompanyForm handleFormSubmit={handleFormSubmit} /> 
            )}
        </div>
    );
};

export default CompanyPage; // Export the CompanyPage component for use in other parts of the application
