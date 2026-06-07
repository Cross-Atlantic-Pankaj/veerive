import {useContext} from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CategoryIcon from '@mui/icons-material/Category';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BusinessIcon from '@mui/icons-material/Business';
import SourceIcon from '@mui/icons-material/Source';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DomainIcon from '@mui/icons-material/Domain';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import ImageIcon from '@mui/icons-material/Image';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

// Styled components with the new blue color
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: '#4F46E5',
    boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    padding: theme.spacing(0.5, 2),
    minHeight: '48px',
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(0.5, 3),
    },
}));

const LogoText = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    letterSpacing: '1px',
    fontSize: '1.4rem',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 0.5),
    borderRadius: '16px',
    padding: '4px 12px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: alpha('#ffffff', 0.1),
        transform: 'translateY(-2px)',
    },
}));

const HeaderComponent = () => {
    const navigate = useNavigate();
    const { handleLogout } = useContext(AuthContext);

    const handleMenuItemClick = (item) => {
        if (item.path) {
            navigate(item.path);
        }
    };

    // Define menu items
    const userDataItems = [
        {
            id: 'user-details',
            label: 'User Details',
            path: '/user-details',
            icon: <AccountCircleIcon />
        }
    ];

    const masterDataItems = [
        {
            id: 'post',
            label: 'Post',
            path: '/posts',
            icon: <PostAddIcon />
        },
        {
            id: 'context',
            label: 'Context',
            path: '/contexts',
            icon: <CategoryIcon />
        },
        {
            id: 'theme',
            label: 'Theme',
            path: '/themes',
            icon: <ColorLensIcon />
        },
        { divider: true },
        {
            id: 'company',
            label: 'Company',
            path: '/companies',
            icon: <BusinessIcon />
        },
        {
            id: 'source',
            label: 'Source',
            path: '/sources',
            icon: <SourceIcon />
        },
        { divider: true },
        {
            id: 'signal',
            label: 'Business Signal',
            path: '/signals',
            icon: <TrendingUpIcon />
        },
        {
            id: 'sub-signal',
            label: 'Business Sub-Signal',
            path: '/sub-signals',
            icon: <TrendingDownIcon />
        },
        { divider: true },
        {
            id: 'sector',
            label: 'Sector',
            path: '/sectors',
            icon: <DomainIcon />
        },
        {
            id: 'sub-sector',
            label: 'Sub-Sector',
            path: '/sub-sectors',
            icon: <DomainIcon />
        },
        { divider: true },
        {
            id: 'region',
            label: 'Region',
            path: '/regions',
            icon: <PublicIcon />
        },
        {
            id: 'country',
            label: 'Country',
            path: '/countries',
            icon: <LocationOnIcon />
        },
        { divider: true },
        {
            id: 'tile-templates',
            label: 'Tile Templates',
            path: '/tile-templates',
            icon: <DashboardIcon />
        },
        {
            id: 'clarification-guidance',
            label: 'Clarification Guidance',
            path: '/clarification-guidance',
            icon: <HelpIcon />
        },
        {
            id: 'query-refiner',
            label: 'Query Refiner',
            path: '/query-refiner',
            icon: <SearchIcon />
        },
        {
            id: 'market-data',
            label: 'Market Data',
            path: '/market-data',
            icon: <TimelineIcon />
        },
        { divider: true },
        {
            id: 'images',
            label: 'Images',
            path: '/images',
            icon: <ImageIcon />
        },
        {
            id: 'drivers',
            label: 'Driver',
            path: '/drivers',
            icon: <DriveEtaIcon />
        }
    ];

    return (
        <StyledAppBar position="sticky">
            <StyledToolbar>
            <LogoText 
                    variant="h5" 
                    sx={{ flexGrow: 1 }}
                    onClick={() => navigate('/admin-home')}
                >
                    Veerive CMS
                </LogoText>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CustomDropdown
                        id="user-data"
                        buttonText="User Data"
                        buttonIcon={<AccountCircleIcon />}
                        items={userDataItems}
                        onItemClick={handleMenuItemClick}
                    />
                    
                    <CustomDropdown
                        id="master-data"
                        buttonText="Master Data"
                        buttonIcon={<MenuIcon />}
                        items={masterDataItems}
                        onItemClick={handleMenuItemClick}
                    />
                    
                    <StyledButton 
                        color="inherit" 
                        onClick={() => navigate('/settings')}
                        startIcon={<SettingsIcon />}
                    >
                        Settings
                    </StyledButton>

                    <StyledButton 
                        color="inherit" 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </StyledButton>
                </Box>
            </StyledToolbar>
        </StyledAppBar>
    );
};

export default HeaderComponent;
