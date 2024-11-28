import React, { useState, useEffect } from "react";
import quizData from "../../utils/quizData.json"; // Import the file containing questions and difficulty

const AddQuiz = () => {

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {

      try {

        const response = await fetch('http://localhost:3000/getcategories'); // Replace with correct endpoint
        const data = await response.json();
        console.log('Fetched data:', data);
        setCategories(data.categories || []); // Ensure categories is always an array
      }
      catch (error) {
        console.error('Error fetching quiz categories:', error);
        setCategories([]); // Fallback to empty array
      }
    };

    fetchCategories();
  }, []);

  // Populate questions and difficulty from the JSON file
  useEffect(() => {
    setQuestions(quizData.questions); // Load questions
    setDifficulty(quizData.difficulty); // Load difficulty level
    console.log('File Data: ', quizData);
  }, []);

  const handleQuestionChange = (index, key, value) => {
    const updatedQuestions = [...questions];
    if (key === "options") {
      updatedQuestions[index].options = value;
    } else {
      updatedQuestions[index][key] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quizDetails = { category: selectedCategory, difficulty, questions };
    console.log('Quiz details: ',quizDetails);
    try {
      const response = await fetch(`http://localhost:3000/addquestionset/${selectedCategory}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizDetails),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Quiz added successfully!");
        setQuestions([{ questionText: '', options: ['', '', '', ''], answer: '' }]);
        navigate('/questions')
      }
      else {
        console.error("Error adding quiz:", response.statusText);
        alert(result.message || 'Failed to add quiz.');
      }
    }
    catch (error) {
      console.log('Issue while adding Questions');
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-emerald-300 via-cyan-100 to-sky-200">
      {/* <div className='bg-lime-100 shadow-md rounded-lg py-8 px-10 max-w-7xl sm:w-96'> */}
        <h2 className="form-title text-center mb-6 font-bold text-2xl text-purple-600 mt-8">Add Quiz</h2>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div>
            <label htmlFor="category">Select Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select mb-4 ml-4 w-64 h-10"
            >
              <option value="">-- Select a Category --</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.dbTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty">Difficulty Level:</label>
            <input
              type="text"
              id="difficulty"
              value={difficulty}
              readOnly // Automatically filled
              className="ml-4"
            />
          </div>

          {/* Questions */}
          <h3 className="questions-title text-center mr-10 font-semibold my-4">Questions</h3>
          {questions.map((question, index) => (
            <div key={index} className="question">
              <label>Question {index + 1}</label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                className="question-input border border-2 ml-2 h-10 w-[550px] mb-4"
              />
              <div className="options">
              <label>Options</label>
                {question.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleQuestionChange(index, "options", [
                        ...question.options.slice(0, optionIndex),
                        e.target.value,
                        ...question.options.slice(optionIndex + 1),
                      ])
                    }
                    className="option-input border border-2 w-auto p-2 h-8 mb-4 ml-4"
                  />
                ))}
              </div>
              <label>Correct Answer</label>
              <input
                type="text"
                placeholder="Correct Answer"
                value={question.answer}
                onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                className="answer-input border border-2 w-fit h-6 mb-4 ml-4"
              />
            </div>
          ))}

          <button type="submit" disabled={isLoading} className=" mt-6 submit-btn w-20 h-8 rounded-md bg-gray-400 hover:bg-gray-300">
            {isLoading ? 'Adding...' : 'Submit'}
          </button>
        </form>
      {/* </div> */}
    </div>
  );
};

export default AddQuiz;
