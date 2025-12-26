import React from "react";
import Joyride, { STATUS } from "react-joyride";

const WebsiteTour = ({ run, setRun }) => {
  
  const steps = [
    // --- SECTION 1: NAVBAR (Top) ---
    {
      target: '.tour-logo',
      content: 'Welcome to Medinauts! This is your home base for AI-powered health analysis.',
      placement: 'bottom-start',
      disableBeacon: true, 
    },
    {
      target: '.tour-nav-team',
      content: 'Meet the brilliant minds of engineers and doctors behind this project.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-contact',
      content: 'Have questions? Reach out directly via our contact page.',
      placement: 'bottom',
    },
    
    // --- SECTION 2: HERO LEFT (Middle) ---
    {
      target: '.tour-desc',
      content: 'Our AI analyzes clinical data points to predict heart disease risk with 98-100% accuracy.',
      placement: 'right',
    },
    {
      target: '.tour-predict-btn',
      content: 'Ready to check your health? Click here to start the prediction.',
      placement: 'bottom',
    },
    {
      target: '.tour-demo-btn', 
      content: 'Not sure what to do? Watch this quick video demo first!',
      placement: 'bottom',
    },
    {
      target: '.tour-stats',
      content: 'We ensure high accuracy and instant, 24/7 availability.',
      placement: 'top',
    },


    // --- SECTION 3: FLOATING (Bottom) ---
    {
      // 👇 FIXED: Matches the class in your Chatbot.jsx
      target: '.tour-chatbot', 
      content: 'Need help? Click here to chat with our AI Medical Assistant instantly!',
      placement: 'top-start',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true} 
      showProgress={true}
      
      styles={{
        options: {
          primaryColor: "#E63946",
          zIndex: 10000,
        },
        buttonClose: {
          display: "none", // Hides the 'X' icon
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default WebsiteTour;
