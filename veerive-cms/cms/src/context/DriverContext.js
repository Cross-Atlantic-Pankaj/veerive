import { createContext } from "react";

const DriverContext = createContext({
    drivers: { data: [], editId: null, totalPages: 1, currentPage: 1, allDrivers: [] },
    fetchDrivers: () => {},
    fetchAllDrivers: () => {},
    fetchDriversPageData: () => {},
    isFormVisible: false,
    setIsFormVisible: () => {},
    driversDispatch: () => {},
    handleAddClick: () => {},
    handleEditClick: () => {},
    handleFormSubmit: () => {},
    currentPage: 1,
    setCurrentPage: () => {}
});

export default DriverContext;
