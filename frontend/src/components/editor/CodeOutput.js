import React from 'react';

function CodeOutput({ output }) {
  return (
    <div className="border rounded overflow-y-auto p-4" style={{ height: '43vh', whiteSpace: 'pre-wrap', overflowX: 'hidden' }}>
      {
        output.split('\n').map((line, index) => (
          <div className="font-mono" key={index}>
            {line}
          </div>
        ))
      }
    </div>
  );
}

export default CodeOutput;
