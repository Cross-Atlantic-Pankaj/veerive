import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import PostContext from './context/PostContext';
import AuthContext from './context/AuthContext';
import { RegionProvider } from './components/RegionProvider';
import { CountryProvider } from './components/CountryProvider';
import { SectorProvider } from './components/SectorProvider';
import { SubSectorProvider } from './components/SubSectorProvider';
import { SignalProvider } from './components/SignalProvider';
import { SubSignalProvider } from './components/SubSignalProvider';
import { CompanyProvider } from './components/CompanyProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { SourceProvider } from './components/SourceProvider';
import { ContextProvider } from './components/ContextProvider';
import { PostProvider } from './components/PostProvider';
import { TileTemplateProvider } from './components/TileTemplateProvider';
import { MarketDataProvider } from './components/MarketDataProvider';
import { DriverProvider } from './components/DriverProvider';
import { ImageProvider } from './components/ImageProvider';
import { MasterDataProvider } from './context/MasterDataContext';
import Login from './pages/Login';
import HeaderComponent from './pages/HeaderComponent';
import RegionPage from './pages/Region/RegionPage';
import CountryPage from './pages/Country/CountryPage';
import SectorPage from './pages/Sector/SectorPage';
import SubSectorPage from './pages/SubSector/SubSectorPage';
import SignalPage from './pages/Signal/SignalPage';
import SubSignalPage from './pages/SubSignal/SubSignalPage';
import CompanyPage from './pages/Company/CompanyPage';
import SourcePage from './pages/Source/SourcePage';
import ThemePage from './pages/Theme/ThemePage';
import ContextPage from './pages/Context/ContextPage';
import PostPage from './pages/Post/PostPage';
import TileTemplatePage from './pages/TileTemplate/TileTemplatePage';
import TileTemplateFormPage from './pages/TileTemplate/TileTemplateFormPage';
import ContainerPage from './pages/Container/ContainerPage';
import PrivateRoute from './components/PrivateRoute'
import StoryOrder from './pages/StoryOrder/StoryOrder';
import StoryView from './pages/StoryOrder/StoryView';
import UserListPage from './pages/UserListPage';
import AdminHomePage from './pages/AdminHomePage';
import SettingsPage from './pages/SettingsPage';
import ForgotPassword from './pages/ForgotPassowrd';
import ResetPassword from './pages/ReasetPassword';
import ContextForm from './pages/Context/ContextForm';
import CompanyForm from './pages/Company/CompanyForm';
import SourceForm from './pages/Source/SourceForm';
import ClarificationGuidanceList from './pages/ClarificationGuidance/ClarificationGuidanceList';
import ClarificationGuidanceForm from './pages/ClarificationGuidance/ClarificationGuidanceForm';
import QueryRefinerList from './pages/QueryRefiner/QueryRefinerList';
import QueryRefinerForm from './pages/QueryRefiner/QueryRefinerForm';
import MarketDataList from './pages/MarketData/MarketDataList';
import MarketDataForm from './pages/MarketData/MarketDataForm';
import DriverPage from './pages/Driver/DriverPage';
import ImagePage from './pages/Image/ImagePage';

function App() {
  const { state, loading  } = useContext(AuthContext);
  const location = useLocation();
  const postContext = useContext(PostContext); // ✅ Get PostContext safely
  const fetchPosts = postContext?.fetchPosts || (() => {}); // ✅ Prevent error if undefined

  // Define paths where header should be hidden
  const authPaths = ['/', '/login', '/forgot-password', '/reset-password'];
  const shouldShowHeader = state.isLoggedIn && !authPaths.includes(location.pathname);

  // ✅ DISABLED - Only load posts when Post page is accessed
  // useEffect(() => {
  //   if (state.isLoggedIn && fetchPosts) {
  //     fetchPosts(); // ✅ Fetch all posts only when logged in
  //   }
  // }, [state.isLoggedIn, fetchPosts]);

  // If loading is true, show a loading indicator
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#4F46E5'
      }}>
        Loading...
      </div>
    );
  }
  return (
    <MasterDataProvider>
      <RegionProvider>
        <CountryProvider>
          <SectorProvider>
            <SubSectorProvider>
              <SignalProvider>
                <SubSignalProvider>
                  <CompanyProvider>
                    <SourceProvider>
                      <ThemeProvider>
                        <ContextProvider>
                          <MarketDataProvider>
                            <DriverProvider>
                              <ImageProvider>
                                <PostProvider>
                                  <TileTemplateProvider>
                              <div>
                                {shouldShowHeader && <HeaderComponent />}
                                
                                <Routes>
                                  <Route path="/" element={<Login />} />
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/forgot-password" element={<ForgotPassword />} />
                                  <Route path="/reset-password" element={<ResetPassword />} />
                                  <Route
                                      path="/admin-home"
                                      element={
                                          <PrivateRoute>
                                              <AdminHomePage />
                                          </PrivateRoute>
                                      }
                                  />

                                  <Route path="/user-details" element={
                                    <PrivateRoute>
                                      <UserListPage />
                                    </PrivateRoute>
                                  } />

                                  <Route path="/themes" element={
                                    <PrivateRoute>
                                    <ThemePage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/admin/themes" element={
                                    <PrivateRoute>
                                    <ThemePage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/tile-templates" element={
                                    <PrivateRoute>
                                    <TileTemplatePage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/tile-templates/new" element={
                                    <PrivateRoute>
                                    <TileTemplateFormPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/tile-templates/edit/:id" element={
                                    <PrivateRoute>
                                    <TileTemplateFormPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/companies" element={
                                    <PrivateRoute>
                                    <CompanyPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/sources" element={
                                    <PrivateRoute>
                                    <SourcePage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/signals" element={
                                    <PrivateRoute>
                                    <SignalPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/sub-signals" element={
                                    <PrivateRoute>
                                    <SubSignalPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/sectors" element={
                                    <PrivateRoute>
                                    <SectorPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/sub-sectors" element={
                                    <PrivateRoute>
                                    <SubSectorPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/regions" element={
                                    <PrivateRoute>
                                    <RegionPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/countries" element={
                                    <PrivateRoute>
                                    <CountryPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/contexts" element={
                                    <PrivateRoute>
                                    <ContextPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/posts" element={
                                    <PrivateRoute>
                                    <PostPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/admin/posts" element={
                                    <PrivateRoute>
                                    <PostPage />
                                    </PrivateRoute>
                                    } />
                                <Route path="/container-module" element={
                                    <PrivateRoute>
                                    <ContainerPage />
                                    </PrivateRoute>
                                    } />

                                <Route path="/story-order" element={
                                    <PrivateRoute>
                                    <StoryOrder />
                                    </PrivateRoute>
                                    } />
                                
                                  <Route path="/story-view" element={
                                    <PrivateRoute>
                                    <StoryView />
                                    </PrivateRoute>
                                    } />

                                    <Route path="/settings" element={
                                    <PrivateRoute>
                                    <SettingsPage />
                                    </PrivateRoute>
                                    } />
                                  <Route path="/admin/contexts" element={
                                    <PrivateRoute>
                                      <ContextForm />
                                    </PrivateRoute>
                                  } />
                                  <Route path="/companies/add" element={
                                    <PrivateRoute>
                                      <CompanyForm />
                                    </PrivateRoute>
                                  } />
                                  <Route path="/sources/add" element={
                                    <PrivateRoute>
                                      <SourceForm />
                                    </PrivateRoute>
                                  } />
                                  <Route path="/clarification-guidance" element={<PrivateRoute><ClarificationGuidanceList /></PrivateRoute>} />
                                  <Route path="/clarification-guidance/add" element={<PrivateRoute><ClarificationGuidanceForm /></PrivateRoute>} />
                                  <Route path="/clarification-guidance/edit/:id" element={<PrivateRoute><ClarificationGuidanceForm /></PrivateRoute>} />
                                  <Route path="/query-refiner" element={<PrivateRoute><QueryRefinerList /></PrivateRoute>} />
                                  <Route path="/query-refiner/add" element={<PrivateRoute><QueryRefinerForm /></PrivateRoute>} />
                                  <Route path="/query-refiner/edit/:id" element={<PrivateRoute><QueryRefinerForm /></PrivateRoute>} />
                                  <Route path="/market-data" element={<PrivateRoute><MarketDataList /></PrivateRoute>} />
                                  <Route path="/market-data/add" element={<PrivateRoute><MarketDataForm /></PrivateRoute>} />
                                  <Route path="/market-data/edit/:id" element={<PrivateRoute><MarketDataForm /></PrivateRoute>} />
                                  <Route path="/drivers" element={<PrivateRoute><DriverPage /></PrivateRoute>} />
                                  <Route path="/images" element={<PrivateRoute><ImagePage /></PrivateRoute>} />
                                </Routes>

                                <ToastContainer />
                              </div>
                              </TileTemplateProvider>
                                </PostProvider>
                              </ImageProvider>
                            </DriverProvider>
                          </MarketDataProvider>
                        </ContextProvider>
                      </ThemeProvider>
                    </SourceProvider>
                  </CompanyProvider>
                </SubSignalProvider>
              </SignalProvider>
            </SubSectorProvider>
          </SectorProvider>
        </CountryProvider>
      </RegionProvider>
    </MasterDataProvider>
  );
}
export default App;
