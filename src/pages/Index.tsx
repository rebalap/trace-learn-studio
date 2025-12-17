import { useState, useCallback } from "react";
import { Check, Lightbulb, RefreshCw } from "lucide-react";
import TracingCanvas from "@/components/TracingCanvas";
import ActionButton from "@/components/ActionButton";
import FeedbackModal from "@/components/FeedbackModal";
import {
  letterPaths,
  numberPaths,
  getRandomLetter,
  getRandomNumber,
} from "@/data/letterPaths";

const Index = () => {
  const [currentLetter, setCurrentLetter] = useState(getRandomLetter);
  const [currentNumber, setCurrentNumber] = useState(getRandomNumber);
  const [showLetterHint, setShowLetterHint] = useState(false);
  const [showNumberHint, setShowNumberHint] = useState(false);
  const [validateLetter, setValidateLetter] = useState(false);
  const [validateNumber, setValidateNumber] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [letterComplete, setLetterComplete] = useState(false);
  const [numberComplete, setNumberComplete] = useState(false);

  const handleValidate = () => {
    setValidateLetter(true);
    setValidateNumber(true);
  };

  const handleLetterComplete = useCallback((success: boolean) => {
    setLetterComplete(success);
  }, []);

  const handleNumberComplete = useCallback((success: boolean) => {
    setNumberComplete(success);
  }, []);

  const handleValidationComplete = useCallback(() => {
    setValidateLetter(false);
    setValidateNumber(false);

    // Show feedback after both validations
    setTimeout(() => {
      setFeedbackSuccess(letterComplete && numberComplete);
      setFeedbackOpen(true);
    }, 100);
  }, [letterComplete, numberComplete]);

  const handleShowHint = () => {
    setShowLetterHint(true);
    setShowNumberHint(true);
    setTimeout(() => {
      setShowLetterHint(false);
      setShowNumberHint(false);
    }, 2000);
  };

  const handleNewCharacters = () => {
    setCurrentLetter(getRandomLetter());
    setCurrentNumber(getRandomNumber());
    setLetterComplete(false);
    setNumberComplete(false);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (feedbackSuccess) {
      handleNewCharacters();
    }
  };

  return (
    <main className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display text-primary mb-2 animate-bounce-in">
            Trace & Learn!
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect the dots to draw letters and numbers
          </p>
        </header>

        {/* Canvases */}
        <section className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-display text-accent">
              Letter: {currentLetter}
            </h2>
            <TracingCanvas
              character={currentLetter}
              dots={letterPaths[currentLetter]}
              onComplete={handleLetterComplete}
              showHint={showLetterHint}
              validate={validateLetter}
              onValidationComplete={() => {}}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-display text-accent">
              Number: {currentNumber}
            </h2>
            <TracingCanvas
              character={currentNumber}
              dots={numberPaths[currentNumber]}
              onComplete={handleNumberComplete}
              showHint={showNumberHint}
              validate={validateNumber}
              onValidationComplete={handleValidationComplete}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-wrap justify-center gap-4">
          <ActionButton variant="validate" onClick={handleValidate}>
            <Check className="w-6 h-6" />
            Check My Work
          </ActionButton>

          <ActionButton variant="hint" onClick={handleShowHint}>
            <Lightbulb className="w-6 h-6" />
            Show Hint
          </ActionButton>

          <button
            onClick={handleNewCharacters}
            className="btn-bounce flex items-center gap-2 px-6 py-4 rounded-2xl font-display text-xl
              bg-primary text-primary-foreground shadow-button hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-6 h-6" />
            New Challenge
          </button>
        </section>

        {/* Instructions */}
        <section className="mt-10 text-center">
          <div className="inline-flex flex-wrap justify-center gap-6 bg-card p-6 rounded-2xl shadow-playful">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent" />
              <span className="text-muted-foreground">Start here</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary" />
              <span className="text-muted-foreground">Next dot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-success" />
              <span className="text-muted-foreground">Connected!</span>
            </div>
          </div>
        </section>
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        success={feedbackSuccess}
        onClose={handleFeedbackClose}
      />
    </main>
  );
};

export default Index;
