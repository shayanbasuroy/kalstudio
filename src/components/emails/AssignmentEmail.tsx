import * as React from 'react';

interface AssignmentEmailProps {
  name: string;
  clientName: string;
  serviceType: string;
  deadline: string;
}

export const AssignmentEmailTemplate: React.FC<Readonly<AssignmentEmailProps>> = ({
  name,
  clientName,
  serviceType,
  deadline,
}) => (
  <div style={{
    fontFamily: 'Helvetica, Arial, sans-serif',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #f0f0f0'
  }}>
    <h1 style={{
      fontSize: '48px',
      fontWeight: 'bold',
      letterSpacing: '-0.05em',
      marginBottom: '24px',
      color: '#1a1a1a'
    }}>
      New Mission.<br />Assigned.
    </h1>
    
    <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
      Hello {name},<br /><br />
      You have been assigned to a new project: **{clientName}**.
    </p>

    <div style={{ 
      backgroundColor: '#f9f9f9', 
      padding: '24px', 
      borderRadius: '16px',
      marginBottom: '32px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0', color: '#a0a0a0' }}>Service Type</p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>{serviceType}</p>
      </div>
      <div>
        <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0', color: '#a0a0a0' }}>Target Deadline</p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>{deadline}</p>
      </div>
    </div>

    <div style={{ marginBottom: '40px' }}>
      <a href="http://localhost:3000/dashboard/employee/projects" style={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '16px 32px',
        textDecoration: 'none',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.2em'
      }}>
        View Project Details
      </a>
    </div>

    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '40px 0' }} />
    
    <p style={{ fontSize: '10px', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Kal Studio — High-End Web Architecture & Growth.
    </p>
  </div>
);
