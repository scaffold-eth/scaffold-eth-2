"use client";

import React, { useState } from "react";
import QuestionComponent from "~~/components/Question";
// import Question from "~/components/Question";
import { Answers, Question } from "~~/utils/scaffold-eth/quiz";

// We will create this component next
const questions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["New York", "London", "Paris", "Dubai"],
    answer: "Paris",
  },
  {
    question: "Who is the CEO of Tesla?",
    options: ["Jeff Bezos", "Elon Musk", "Bill Gates", "Steve Jobs"],
    answer: "Elon Musk",
  },
  // Add more questions as needed
];
// interface QuizProps {
//   questions: Question[];
// }

const Quiz = () => {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<string | null>(null);

  const handleOptionChange = (questionIndex: number, option: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const score = questions.reduce((total, question, index) => {
      if (answers[index] === question.answer) {
        return total + 1;
      }
      return total;
    }, 0);

    setResult(`You scored ${score} out of ${questions.length}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <QuestionComponent
            key={index}
            question={question}
            questionIndex={index}
            handleOptionChange={handleOptionChange}
            currentAnswer={answers[index]}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};
export default Quiz;
