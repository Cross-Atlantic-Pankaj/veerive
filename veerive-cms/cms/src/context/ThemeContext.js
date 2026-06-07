import { createContext } from "react";

const ThemeContext = createContext({
    themes: { data: [], editId: null, totalPages: 1, currentPage: 1, allThemes: [] },
    fetchThemes: () => {},
    fetchAllThemes: () => {},
    fetchThemesPageData: () => {},
    isFormVisible: false,
    setIsFormVisible: () => {},
    themesDispatch: () => {},
    handleAddClick: () => {},
    handleEditClick: () => {},
    handleFormSubmit: () => {},
    sectors: { data: [] },
    subSectors: { data: [] },
    currentPage: 1,
    setCurrentPage: () => {}
});

export default ThemeContext;
