"use client";

import React from "react";
import { Question } from "~~/utils/scaffold-eth/quiz";

interface QuestionProps {
  question: Question;
  questionIndex: number;
  handleOptionChange: (questionIndex: number, option: string) => void;
  currentAnswer?: string;
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, questionIndex, handleOptionChange, currentAnswer }) => {
  return (
    <div className="p-6 border rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-center">
            <input
              type="radio"
              className="mr-2"
              name={`question-${questionIndex}`}
              value={option}
              checked={currentAnswer === option}
              onChange={() => handleOptionChange(questionIndex, option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionComponent;
