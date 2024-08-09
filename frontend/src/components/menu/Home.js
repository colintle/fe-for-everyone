import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import ProgressBar from './ProgressBar';
import { MyContext } from '../../MyProvider';

function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    mode: '',
    exam: ''
  });
  const {setSingle, setMulti} = useContext(MyContext)
  const navigate = useNavigate()


  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleModeSelection = (mode) => {
    setFormData((prevData) => ({
      ...prevData,
      mode: mode,
    }));
    nextStep();
  };

  const handleExamSelection = (exam) => {
    setFormData((prevData) => ({
      ...prevData,
      exam: exam,
    }));
    nextStep();
  };

  const handleSubmit = () => {
    // Here you would normally submit the data to an API or handle it as needed.
    console.log('Submitted data:', formData);

    if (formData.mode === "Single"){
      setSingle(formData)
      navigate("/code")
    }

    if (formData.mode === "Multi"){
      setMulti(formData)
      navigate("/code")
    }

    
  };

  return (
    <div className="flex flex-col items-center pt-48 h-full">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="w-full">
          {currentStep === 1 && <Step1 nextStep={handleModeSelection} />}
          {currentStep === 2 && (
            <Step2 nextStep={handleExamSelection} prevStep={prevStep} />
          )}
          {currentStep === 3 && (
            <Step3 data={formData} prevStep={prevStep} submit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
