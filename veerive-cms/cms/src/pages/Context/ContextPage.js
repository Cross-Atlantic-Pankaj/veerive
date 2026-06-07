import React, { useContext } from 'react'; // Import React and useContext hook for accessing context
import ContextContext from '../../context/ContextContext'; // Import the context for managing global state
import ContextList from './ContextList'; // Import the ContextList component for displaying the list of contexts
import ContextForm from './ContextForm'; // Import the ContextForm component for adding or editing contexts
import '../../html/css/Context.css'; // Import the CSS file for styling the ContextPage component

const ContextPage = () => { // Define the functional component ContextPage
    // Use the useContext hook to access context values and functions
    const {  isFormVisible,  handleFormSubmit } = useContext(ContextContext);

    return (
        <div className="contexts-container"> {/* Container div for the contexts page */}
            {/* <h2>Contexts Master</h2> Heading for the contexts page */}
            {!isFormVisible ? ( // Conditional rendering based on the visibility of the form
                <>
                    <ContextList /> 
                </>
            ) : (
                <ContextForm handleFormSubmit={handleFormSubmit} /> 
            )}
        </div>
    );
};

export default ContextPage; // Export the ContextPage component for use in other parts of the application
