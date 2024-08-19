import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { styled } from '@mui/system';
import GitHubIcon from '@mui/icons-material/GitHub';
import PropTypes from 'prop-types';

const Logo = styled('img')({
    marginRight: '16px',
    width: '80px',
    height: '34px',
});

const Header = ({ children }) => {
    return (
        <AppBar position="static">
            <Toolbar className="app-bar" sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Logo src="./logo.png" alt="Logo" />
                    <Typography variant="h6" sx={{ mr: 2 }}>
                        Design and Recommendation Tool
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="GitHub repository"
                        component="a"
                        href="https://github.com/sight0/r4ck"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon />
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {children}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

Header.propTypes = {
    children: PropTypes.node,
};

export default Header;
