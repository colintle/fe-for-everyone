import React from 'react'

const EmptyPage = () => {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="p-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">Oops!</h1>
            <p className="text-lg mb-2">Sorry, an unexpected error has occurred.</p>
            <p className="text-gray-500 italic">Not Found</p>
          </div>
        </div>
      </div>
    );
};

export default EmptyPage;