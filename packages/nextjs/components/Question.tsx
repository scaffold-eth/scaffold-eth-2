// Question.tsx
"use client";

import React from "react";
import { Question } from "~~/utils/scaffold-eth/quiz";

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

// Question.tsx

interface QuestionProps {
  question: Question;
  questionIndex: number;
  handleOptionChange: (questionIndex: number, option: string) => void;
  currentAnswer?: string;
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, questionIndex, handleOptionChange, currentAnswer }) => {
  return (
    <div>
      <h3>{question.question}</h3>
      {question.options.map((option, index) => (
        <label key={index}>
          <input
            type="radio"
            name={`question-${questionIndex}`}
            value={option}
            checked={currentAnswer === option}
            onChange={() => handleOptionChange(questionIndex, option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
};

export default QuestionComponent;
