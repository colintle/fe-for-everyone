import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import ProgressBar from './ProgressBar';
import { MyContext } from '../../MyProvider';
import { useRoomApiCalls } from '../../utils/room/useRoomApiCalls';

function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    mode: '',
    exam: '',
    roomName: ''
  });
  const { accessToken, setSingle, setMulti, setRoomData, setLoading } = useContext(MyContext);
  const navigate = useNavigate();

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const { isJoined, createRoom } = useRoomApiCalls();

  useEffect(() => {
    setSingle(false);
    setMulti(false);
    setRoomData({});
  }, [setSingle, setMulti, setRoomData]);

  useEffect(() => {
    const checkJoined = async () => {    
      const response = await isJoined();  
      if (response?.room) {
        setMessage("Please leave the current room to join another room. Click the 'Join Room' button at top right corner.");
      }
    };
    if (accessToken){
      checkJoined();
    }
  }, [accessToken, isJoined]);

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
    if (formData.mode === "Single") {
      setSingle(formData);
      navigate("/code");
    }

    if (formData.mode === "Multi") {
      setLoading(true);
      const response = await createRoom(formData.roomName, formData.exam);
      if (response.error) {
        setMessage('Error creating the room. Please try again.');
        setLoading(false);
        return;
      }

      setRoomData(response);
      setMulti(formData);
      setLoading(false);
      navigate("/code");
    }
  };

  // useEffect(() => {
  //   if (formData.mode === "Multi" && socket) {
  //     setLoading(false)
  //     navigate("/code");
  //   }
  // }, [socket, formData.mode, navigate, setLoading]);

  return (
    <div className="flex flex-col items-center pt-48 h-full">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Step Content */}
        {message ? 
          <p className="text-red-500 text-sm mb-4">{message}</p> : 
          <div className="w-full">
            {currentStep === 1 && <Step1 nextStep={handleModeSelection} />}
            {currentStep === 2 && (
              <Step2 nextStep={handleExamSelection} prevStep={prevStep} />
            )}
            {currentStep === 3 && (
              <Step3 data={formData} prevStep={prevStep} submit={handleSubmit} />
            )}
          </div>
        }
      </div>
    </div>
  );
}

export default Home;
