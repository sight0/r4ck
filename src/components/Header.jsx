import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { styled } from '@mui/system';
import GitHubIcon from '@mui/icons-material/GitHub';
import PropTypes from 'prop-types';

const Logo = styled('img')({
    marginRight: '16px',
    width: '80px',
    height: '34px',
});

const Title = styled(Typography)({
    flexGrow: 1,
});

const Header = ({ children }) => {
    return (
        <AppBar position="static">
            <Toolbar className="app-bar">
                <Logo src="/logo.png" alt="Logo" />
                <Title variant="h6">
                    Design and Recommendation Tool
                </Title>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
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
