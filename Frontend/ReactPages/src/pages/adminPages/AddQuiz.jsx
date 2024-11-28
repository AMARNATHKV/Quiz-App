import React, { useState, useEffect } from 'react';

const AddQuiz = () => {
  const [categories, setCategories] = useState([]); // To store fetched quiz categories
  const [selectedCategory, setSelectedCategory] = useState(''); // To track the selected category
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], answer: '' }]); // Initial question structure
  const [difficulty, setDifficulty] = useState('Medium'); // Default difficulty level
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch quiz categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/getcategories'); // Replace with the correct API endpoint
        const data = await response.json();
        console.log('result data: ', data);

        setCategories(data.categories || []); // Assuming API returns categories in `data.categories`
      } catch (error) {
        console.error('Error fetching quiz categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle changes in the question input fields
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'questionText') {
      updatedQuestions[index].questionText = value;
    } else if (field === 'answer') {
      updatedQuestions[index].answer = value;
    } else {
      updatedQuestions[index].options[field] = value;
    }
    setQuestions(updatedQuestions);
  };

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], answer: '' }]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert('Please select a category!');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/addquestionset/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          questions,
          difficulty,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Quiz added successfully!');
        setQuestions([{ questionText: '', options: ['', '', '', ''], answer: '' }]);
        navigate('/questions')
      } else {
        alert(result.message || 'Failed to add quiz.');
      }
    } catch (error) {
      console.error('Error adding quiz:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-emerald-300 via-cyan-100 to-sky-200">
      <div className='bg-lime-100 shadow-md rounded-lg py-8 px-10 max-w-7xl sm:w-96'>
        <h2 className="form-title text-center mb-6 font-bold text-2xl text-purple-600">Add Quiz</h2>
        <form onSubmit={handleSubmit} className="quiz-form">
          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">Select Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select mb-4 ml-4 w-64 h-8"
            >
              <option value="">-- Select a Category --</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.dbTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="form-group">
            <label htmlFor="difficulty" className="form-label">Difficulty Level:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="form-select ml-4 w-56 h-8"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Questions Section */}
          <h3 className="questions-title text-center mr-10 font-semibold my-4">Questions</h3>
          {questions.map((question, index) => (
            <div key={index} className="question-group">
              <label className="question-label">Question {index + 1}</label>
              <input
                type="text"
                placeholder="Enter question text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                className="question-input border border-black border-2 w-72 h-12 mb-4"
              />

              <div className="options-container">
                {question.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleQuestionChange(index, optionIndex, e.target.value)}
                    className="option-input border border-2 w-72 h-12 mb-4"
                  />
                ))}
              </div>

              <input
                type="text"
                placeholder="Correct Answer"
                value={question.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                className="answer-input border border-2 w-72 h-12 mb-4"
              />

              <button type="button" onClick={() => removeQuestion(index)} className="remove-btn w-36 h-8 rounded-md bg-blue-400 mb-4 hover:bg-blue-200">
                Remove Question
              </button>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="add-btn w-44 h-8 rounded-md bg-gray-400 mr-6 hover:bg-gray-300">
            Add Another Question
          </button>

          <button type="submit" disabled={isLoading} className="submit-btn w-20 h-8 rounded-md bg-gray-400 hover:bg-gray-300">
            {isLoading ? 'Adding...' : 'Submit'}
          </button>
        </form>
      </div>

    </div>
  )
};

export default AddQuiz;
