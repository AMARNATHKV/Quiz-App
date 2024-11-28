import React from 'react';
import CourseCard from './CourseCard';
import { useEffect, useState } from 'react';

const DisplayQuizSet = () => {
  const [quizSet,setQuizSet] = useState([]);
  const [loading,setLoading] = useState(true);

//   const quizSet = isHome ? courses.slice(0,3) : courses;

  useEffect(()=>{
    const fetchQuiz = async () => {
      try{
        const res = await fetch('/displayquizset');
        const data = await res.json();
        console.log(data);
        setQuizSet(data);
      } catch(error){
        console.log('Error fetching courses:',error);
      } finally{
        setLoading(false);
      }
    };
    fetchQuiz();
  },[]);

  if(loading) {
    return <h1 className='text-center mt-10'>Loading...</h1>
  }

  return (
    <>
    <h1 className='flex flex-col items-center font-bold
    text-2xl md:text-4xl text-purple-800 pt-10'>
      Quiz Sets
    </h1>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mx-5 my-10'>
    {quizSet.map((quiz)=>(
            <QuizCard key={quizSet.courseId} course={course} />
        ))}
    </div>
    </>
  );
};

export default DisplayQuizSet;