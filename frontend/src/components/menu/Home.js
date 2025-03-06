import React, { useState, useContext, useEffect } from 'react';
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
    exam: '',
    roomName: ''
  });
  const {setSingle, setMulti, setRoomData} = useContext(MyContext);
  const navigate = useNavigate();

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  useEffect(() => {
    setSingle(false)
    setMulti(false)
    setRoomData({})
  }
    , [setSingle, setMulti]
  )

  const handleModeSelection = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      mode: data.mode,
      roomName: data.roomName
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

  const handleSubmit = async () => {
    if (formData.mode === "Single"){
      setSingle(formData)
      navigate("/code")
    }

    if (formData.mode === "Multi"){
      // make api call to check if user is joined and then join room
      // setRoomData
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
