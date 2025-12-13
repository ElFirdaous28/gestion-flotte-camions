import React from 'react';
import { Link } from 'react-router-dom';

function Logo({ className }) {
  return (
    <Link to="/" className={`flex justify-between items-center max-w-48 min-h-10 ${className}`}>
      <img className="w-10" src="/logo.svg" alt="logo" />
      <h1 className="text-3xl w-44 font-bold">E-Market</h1>
    </Link>
  );
}

export default React.memo(Logo);