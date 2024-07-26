import React, { useState } from 'react';
import './App.css'
import { Grid } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RackVisualization from './components/RackVisualization';
import InitialSetupForm from './components/InitialSetupForm';

const App = () => {
    const [setupComplete, setSetupComplete] = useState(false);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [currentIdf, setCurrentIdf] = useState(1);

    const handleSetupSubmit = (formData) => {
        setNetworkInfo(formData);
        setSetupComplete(true);
    };

    if (!setupComplete) {
        return (
            <>
                <Header />
                <InitialSetupForm onSubmit={handleSetupSubmit} />
            </>
        );
    }

    return (
        <>
            <Header />
            <Grid container>
                <Grid item xs={2}>
                    <Sidebar currentIdf={currentIdf} />
                </Grid>
                <Grid item xs={10}>
                    <RackVisualization 
                        currentIdf={currentIdf} 
                        setCurrentIdf={setCurrentIdf}
                        totalIdfs={networkInfo.idfs}
                        idfUsers={networkInfo.idfUsers}
                    />
                </Grid>
            </Grid>
        </>
    );
}

export default App;

