import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSubmissionTest = () => {
  console.log('CreateSubmissionTest component is rendering!');
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Create Submission Page</h1>
      <p>If you can see this, the routing is working.</p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default CreateSubmissionTest;