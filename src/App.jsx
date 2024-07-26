import './App.css'
import { Grid } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RackVisualization from './components/RackVisualization';

const App = () => {
    return (
        <>
            <Header />
            <Grid container>
                <Grid item xs={2}>
                    <Sidebar />
                </Grid>
                <Grid item xs={10}>
                    <RackVisualization />
                </Grid>
            </Grid>
        </>
    );
}

export default App;

