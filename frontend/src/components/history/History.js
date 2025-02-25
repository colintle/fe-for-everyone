import React, { useState, useContext, useEffect } from 'react';
import { HiMiniArrowSmallLeft, HiMiniArrowSmallRight } from "react-icons/hi2";
import { MyContext } from '../../MyProvider';

import { useCodeApiCalls } from '../../utils/code/useCodeApiCalls';

function History() {
  const { completedProblems, setCompletedProblems, accessToken } = useContext(MyContext);
  const { getCompletedProblems } = useCodeApiCalls();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCompletedProblems = async () => {
      const response = await getCompletedProblems();
      if (response) {
        setCompletedProblems(response.problems);
      }
    };

    fetchCompletedProblems();
  }, [accessToken, getCompletedProblems, setCompletedProblems]);

  const filteredProblems = completedProblems.filter(problem =>
    problem.problemStatementPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.date.includes(searchTerm)
  );

  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage * itemsPerPage < filteredProblems.length) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExamClick = (examName) => {
    const pdfPath = `/solutions/${examName}.pdf`;
    window.open(pdfPath, '_blank'); // Open PDF in a new tab
  };

  return (
    <div className="flex flex-col items-center pt-48 h-full w-full">
      <div className='w-1/3'>
        <h2 className="text-2xl font-bold text-center mb-2">History</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Click on a test to view the solutions.
        </p>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by test name or date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-gray-600">
              <span>Test Name</span>
              <span>Date Completed</span>
            </div>
            <hr className="border-gray-300 mb-2"/>
            {paginatedProblems.map((problem, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 transition duration-200 px-2 py-1 rounded"
                onClick={() => handleExamClick(problem.problemStatementPath)}
              >
                <span>{problem.problemStatementPath}</span>
                <span>{problem.date}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className={`bg-gray-300 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-400 transition duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <HiMiniArrowSmallLeft/>
            </button>
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage * itemsPerPage >= filteredProblems.length}
              className={`bg-gray-300 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-400 transition duration-200 ${currentPage * itemsPerPage >= filteredProblems.length ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <HiMiniArrowSmallRight/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;
