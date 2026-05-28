import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// Standard Enterprise Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/data/')
      .then(res => res.json())
      .then(json => {
        setRawData(json.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading Enterprise Data...</div>;

  // ==========================================
  // ANALYTICS ENGINE: Carbon Conversion (CO2e)
  // ==========================================
  // Applying realistic emission factors to unify the data
  const processedData = rawData.map(row => {
    let co2e = 0;
    if (row.Unit === 'Liters') co2e = row.Value * 2.68; // EPA standard for Diesel
    if (row.Unit === 'kWh') co2e = row.Value * 0.85;    // Standard grid mix
    if (row.Unit === 'Km') co2e = row.Value * 0.15;     // Average flight emissions
    
    return { ...row, CO2e: Math.round(co2e) };
  });

  // Aggregate Data for Charts
  const scopeData = [
    { name: 'Scope 1 (Fuel)', value: processedData.filter(d => d.Unit === 'Liters').reduce((sum, d) => sum + d.CO2e, 0) },
    { name: 'Scope 2 (Power)', value: processedData.filter(d => d.Unit === 'kWh').reduce((sum, d) => sum + d.CO2e, 0) },
    { name: 'Scope 3 (Travel)', value: processedData.filter(d => d.Unit === 'Km').reduce((sum, d) => sum + d.CO2e, 0) }
  ].filter(d => d.value > 0);

  const locationData = processedData.reduce((acc, row) => {
    const existing = acc.find(item => item.Location === row.Location);
    if (existing) {
      existing.Emissions += row.CO2e;
    } else {
      acc.push({ Location: row.Location, Emissions: row.CO2e });
    }
    return acc;
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem' }}>ESG Analytics & Normalization Hub</h1>
      
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0' }}>
        <div style={{ background: '#1e1e1e', padding: '1.5rem', flex: 1, borderRadius: '8px', border: '1px solid #333' }}>
          <h4 style={{ margin: 0, color: '#888' }}>Total Enterprise Footprint</h4>
          <h2 style={{ margin: '0.5rem 0 0 0', color: '#00C49F' }}>
            {processedData.reduce((sum, d) => sum + d.CO2e, 0).toLocaleString()} kg CO2e
          </h2>
        </div>
        <div style={{ background: '#1e1e1e', padding: '1.5rem', flex: 1, borderRadius: '8px', border: '1px solid #333' }}>
          <h4 style={{ margin: 0, color: '#888' }}>Highest Emitting Location</h4>
          <h2 style={{ margin: '0.5rem 0 0 0', color: '#FFBB28' }}>
            {locationData.sort((a, b) => b.Emissions - a.Emissions)[0]?.Location || 'N/A'}
          </h2>
        </div>
      </div>

      {/* Visualizations */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', height: '350px' }}>
        
        {/* Pie Chart: Emissions by Scope */}
        <div style={{ background: '#1e1e1e', padding: '1.5rem', flex: 1, borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0 }}>Emissions by Scope (CO2e)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={scopeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {scopeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} kg`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Emissions by Location */}
        <div style={{ background: '#1e1e1e', padding: '1.5rem', flex: 2, borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0 }}>Footprint by Location</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="Location" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip cursor={{fill: '#2a2a2a'}} formatter={(value) => `${value.toLocaleString()} kg CO2e`} />
              <Bar dataKey="Emissions" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Data Table */}
      <h3 style={{ marginTop: '3rem' }}>Normalized Data Feed</h3>
      <div style={{ overflowX: 'auto', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #444' }}>Date</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #444' }}>Category</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #444' }}>Location</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #444' }}>Raw Consumption</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #444', color: '#00C49F' }}>Calculated CO2e</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '1rem' }}>{row.Date}</td>
                <td style={{ padding: '1rem' }}>{row.Category}</td>
                <td style={{ padding: '1rem' }}>{row.Location}</td>
                <td style={{ padding: '1rem' }}>{row.Value.toLocaleString()} {row.Unit}</td>
                <td style={{ padding: '1rem', color: '#00C49F', fontWeight: 'bold' }}>{row.CO2e.toLocaleString()} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;