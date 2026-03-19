import React, { useState } from 'react';
import './ScannerForm.css'; // Assuming you have a CSS file for styling

const ScannerForm = () => {
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState(null);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('https://api.example.com/scan', {  // Replace with your API endpoint
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ input: inputValue }),
            });
            const data = await response.json();
            setResult(data.result);
        } catch (error) {
            console.error('Error:', error);
            setResult('Error occurred during scanning.');
        }
    };

    return (
        <div className="scanner-form">
            <h1>Scanner Form</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={handleInputChange} 
                    placeholder="Enter text to scan" 
                    required 
                />
                <button type="submit">Scan</button>
            </form>
            {result && <div className="result">Result: {result}</div>}
        </div>
    );
};

export default ScannerForm;