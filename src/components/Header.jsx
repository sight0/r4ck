import { AppBar, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';

const Logo = styled('img')({
    marginRight: '16px',
    width: '80px',
    height: '34px',
});

const Title = styled(Typography)({
    flexGrow: 1,
});

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar className="app-bar">
                <Logo src="/logo.png" alt="Logo" />
                <Title variant="h6">
                    Design and Recommendation Tool
                </Title>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
