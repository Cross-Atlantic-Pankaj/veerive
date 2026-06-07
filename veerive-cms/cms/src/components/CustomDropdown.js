import React, { useState } from 'react';
import { 
    Button, 
    Menu, 
    MenuItem, 
    Box,
    alpha,
    Fade,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0, 0.5),
    borderRadius: '16px',
    padding: '6px 16px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    color: 'white',
    '&:hover': {
        backgroundColor: alpha('#ffffff', 0.1),
        transform: 'translateY(-2px)',
    },
    '& .MuiButton-endIcon': {
        marginLeft: theme.spacing(0.5),
        transition: 'transform 0.3s ease',
    },
    '&.open .MuiButton-endIcon': {
        transform: 'rotate(180deg)',
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '12px',
        marginTop: theme.spacing(1),
        minWidth: 250,
        maxHeight: '400px',
        boxShadow: '0 8px 32px rgba(79, 70, 229, 0.15)',
        border: `1px solid ${alpha('#4F46E5', 0.1)}`,
        '& .MuiMenuItem-root': {
            padding: theme.spacing(1.5, 2),
            fontSize: '0.9rem',
            borderRadius: theme.spacing(1),
            margin: theme.spacing(0.5, 1),
            transition: 'all 0.2s ease',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': {
                backgroundColor: alpha('#4F46E5', 0.08),
                transform: 'translateX(4px)',
            },
            '& .MuiListItemIcon-root': {
                minWidth: '32px',
                color: '#4F46E5',
            },
            '& .MuiListItemText-primary': {
                fontWeight: 500,
                color: '#1a1a1a',
            },
        },
        '& .MuiDivider-root': {
            margin: theme.spacing(1, 2),
            backgroundColor: alpha('#4F46E5', 0.08),
        },
    },
}));

const CountChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#4F46E5',
    color: 'white',
    fontSize: '0.75rem',
    height: '20px',
    minWidth: '24px',
    '& .MuiChip-label': {
        padding: '0 6px',
        fontWeight: 600,
    },
}));

const CustomDropdown = ({ 
    buttonText, 
    buttonIcon, 
    items = [], 
    onItemClick,
    id,
    color = "inherit",
    variant = "text",
    size = "medium"
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleItemClick = (item) => {
        if (onItemClick) {
            onItemClick(item);
        }
        handleClose();
    };

    return (
        <Box>
            <StyledButton
                id={`${id}-button`}
                aria-controls={open ? `${id}-menu` : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={buttonIcon}
                className={open ? 'open' : ''}
                color={color}
                variant={variant}
                size={size}
            >
                {buttonText}
            </StyledButton>
            
            <StyledMenu
                id={`${id}-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': `${id}-button`,
                }}
                TransitionComponent={Fade}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {items.map((item, index) => {
                    if (item.divider && index > 0) {
                        return <Divider key={`divider-${index}`} />;
                    }
                    if (!item.divider) {
                        return (
                            <MenuItem 
                                key={item.id || index}
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    {item.icon && (
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>
                                    )}
                                    <ListItemText 
                                        primary={item.label}
                                        secondary={item.description}
                                    />
                                </Box>
                                {typeof item.count === 'number' && item.count > 0 && (
                                    <CountChip 
                                        label={item.count} 
                                        size="small"
                                    />
                                )}
                            </MenuItem>
                        );
                    }
                    return null;
                })}
            </StyledMenu>
        </Box>
    );
};

export default CustomDropdown; 