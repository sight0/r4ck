import { AppBar, Toolbar, Typography, IconButton, Switch } from '@mui/material';
import { styled } from '@mui/system';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Logo = styled('img')({
    marginRight: '16px',
    width: '80px',
    height: '34px',
});

const Title = styled(Typography)({
    flexGrow: 1,
});

const Header = ({ darkMode, toggleDarkMode }) => {
    return (
        <AppBar position="static">
            <Toolbar className="app-bar">
                <Logo src="/logo.png" alt="Logo" />
                <Title variant="h6">
                    Design and Recommendation Tool
                </Title>
                <IconButton color="inherit" onClick={toggleDarkMode}>
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    color="default"
                />
            </Toolbar>
        </AppBar>
    );
}

export default Header;
