import React, { useState } from 'react';

import { HiMiniArrowSmallLeft, HiMiniArrowSmallRight } from "react-icons/hi2";

const generateExamOptions = () => {
  const seasons = ['Spring', 'Summer', 'Fall'];
  let options = [];
  for (let year = 2021; year <= 2024; year++) {
    for (const season of seasons) {
      options.push({ value: `${season} ${year}` });
    }
  }
  options.push({value: "Random"})
  options = options.filter((key) => key.value !== "Fall 2024")
  return options.reverse();
};

function Step2({ nextStep, prevStep }) {
  const [selectedExam, setSelectedExam] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const allExams = generateExamOptions();

  const filteredExams = allExams.filter((exam) =>
    exam.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelection = (exam) => {
    setSelectedExam(exam);
  };

  const handleNextClick = () => {
    if (selectedExam === "Random") {
      const randomExam = allExams[Math.floor(Math.random() * (allExams.length - 2))].value;
      nextStep(randomExam);
    } else {
      nextStep(selectedExam);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage * itemsPerPage < filteredExams.length) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Select Exam</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
        />
        <div className="space-y-4">
          {paginatedExams.map((exam) => (
            <label key={exam.value} className="flex items-center space-x-2">
              <input
                type="radio"
                name="exam"
                value={exam.value}
                checked={selectedExam === exam.value}
                onChange={() => handleSelection(exam.value)}
              />
              <span>{exam.value}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className={`bg-gray-300 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-400 transition duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HiMiniArrowSmallLeft/>
          </button>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage * itemsPerPage >= filteredExams.length}
            className={`bg-gray-300 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-400 transition duration-200 ${currentPage * itemsPerPage >= filteredExams.length ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <HiMiniArrowSmallRight/>
          </button>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={handleNextClick}
          disabled={!selectedExam}
          className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${!selectedExam ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Step2;
