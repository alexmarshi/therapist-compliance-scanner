import React, { useState } from 'react';

const ScannerPage = () => {
  const [formData, setFormData] = useState({ input: '' });
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    const simulatedResults = `Results for ${formData.input}`;
    setResults(simulatedResults);
  };

  const handleClear = () => {
    setFormData({ input: '' });
    setResults(null);
  };

  return (
    <div>
      <h1>Scanner Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="input"
          value={formData.input}
          onChange={handleChange}
          placeholder="Enter input"
        />
        <button type="submit">Scan</button>
        <button type="button" onClick={handleClear}>Clear</button>
      </form>
      {results && <div>Results: {results}</div>}
    </div>
  );
};

export default ScannerPage;