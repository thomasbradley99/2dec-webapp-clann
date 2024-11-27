import React from 'react';
import clannLogo from '../../assets/images/clann-logo.png';

function Header() {
  return (
    <div className="w-full flex justify-center py-6 bg-gray-900/50">
      <img 
        src={clannLogo} 
        alt="Clann" 
        className="w-32 md:w-36 hover:opacity-90 transition-opacity"
      />
    </div>
  );
}

export default Header; 