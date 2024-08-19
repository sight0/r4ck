const CloseButton = () => {
    const handleClose = () => {
        window.electron.closeWindow();
    };

    return (
        <button
            onClick={handleClose}
            style={{
                top: 10,
                right: 10,
                padding: '5px 10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                fontSize: '1em',
                borderRadius: '3px',
                cursor: 'pointer'
            }}
        >
            X
        </button>
    );
};

export default CloseButton;
