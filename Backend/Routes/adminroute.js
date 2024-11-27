import { Router } from "express";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { QuizCatgry } from "../Models/quizCatgry.js";
import { QuestionSet } from "../Models/questionSet.js";
import { authenticate } from "../Middleware/auth.js";
import Admin from "../Models/adminSet.js";
// import { quizEventEmitter } from "../quizEvents.js";

dotenv.config();
const adminroute = Router();

adminroute.get('/', (req, res) => {

    res.send("Hello World")
});

//Admin Dashboard - Add Quiz topic
adminroute.post('/addcategories', authenticate, async (req, res) => {

    const loginRole = req.UserRole;
    let cnt, CategorySet;

    try {

        if (loginRole == 'admin') {

            const {
                CategoryType,
                Title,
                Description,
                numOfQuestions
            } = req.body;

            const existingCatgry = await QuizCatgry.findOne({ dbTitle: Title });
            if (!existingCatgry) {
                cnt = 1
                CategorySet = Title + '_' + cnt;
            }
            else {

                // Extract the numeric part after the last underscore in dbCategorySet
                const latest = existingCatgry.dbCategorySet;
                const cnt = parseInt(latest.split('_')[1], 10);
                const updated_count = cnt + 1;
                CategorySet = Title + '_' + updated_count;
            }

            if (existingCatgry) {

                const exstngCatgrSet = await QuizCatgry.findOne({ dbCategorySet: CategorySet })
                if (exstngCatgrSet) {
                    res.status(404).json({ message: 'Existing Quiz category' });
                    console.log("Quiz category present");
                }
                else {

                    const newQuizCatgry = new QuizCatgry({
                        dbCategoryType: CategoryType,
                        dbCategorySet: CategorySet,
                        dbTitle: Title,
                        dbDescription: Description,
                        dbNumOfQuestions: numOfQuestions, // Store the number of questions if needed
                        dbQuestions: [] // Set dbquestions array to null initially
                        // createdAt will be set automatically   
                    });
                    const savedQuizCatgry = await newQuizCatgry.save()
                    res.status(201).json({
                        message: 'Quiz category added successfully!',
                        quizCatgryId: savedQuizCatgry._id // Access the automatically generated _id
                    });
                    console.log('New Category Id: ', savedQuizCatgry);
                }

            }
            // Create a new quiz category document
            else {

                const newQuizCatgry = new QuizCatgry({
                    dbCategoryType: CategoryType,
                    dbCategorySet: CategorySet,
                    dbTitle: Title,
                    dbDescription: Description,
                    dbNumOfQuestions: numOfQuestions, // Store the number of questions if needed
                    dbQuestions: [] // Set dbquestions array to null initially
                    // createdAt will be set automatically   
                });
                const savedQuizCatgry = await newQuizCatgry.save()
                res.status(201).json({
                    message: 'Quiz category added successfully!',
                    quizCatgryId: savedQuizCatgry._id // Access the automatically generated _id
                });
                console.log('New Category Id: ', savedQuizCatgry);
            }
        }
        else {
            console.log("Admin access only");
        }
    }
    catch (error) {
        console.log(error);
    }
});

//Retrieving categories from DB

adminroute.get('/getcategories', async (req, res) => {

    const loginRole = req.UserRole; // Extract role from the middleware
    // console.log('loginrole: ',loginRole);

    try {
        // if (loginRole === 'admin') {

            const categories = await QuizCatgry.find({}, 'dbCategoryType dbCategorySet dbTitle dbDescription');

            if (categories.length === 0) {
                return res.status(404).json({ message: 'No categories found' });
            }
            else{
                return res.status(200).json({ categories });
            }
           

        // } else {
            // res.status(403).json({ message: 'Access denied. Admins only.' });
        // }
    } catch (error) {
        console.error('Error fetching quiz categories:', error);
        res.status(500).json({ message: 'Failed to fetch quiz categories' });
    }
});


//Add questions
adminroute.post('/addquestionset/:categoryId', async (req, res) => {

    const loginRole = req.UserRole;
    try {

        // if (loginRole == 'admin') {

            const { categoryId } = req.params;
            console.log(categoryId);

            const { category, questions } = req.body; // Destructure the input fields from the request body

            const existingCatgry = await QuizCatgry.findById(categoryId);
            // console.log(existingCatgry);
            const existingQuestion = await QuestionSet.findOne({ dbquizId: categoryId });
            // console.log(existingQuestion);


            if (!existingCatgry) {
                return res.status(404).json({ message: 'Quiz category not found' });
            }
            else {
                if (existingQuestion) {
                    res.status(404).json({ message: 'Duplicate Question set' });
                    console.log("Question set available");
                }
                else {
                    // Create a new question set document
                    const newQuestionSet = new QuestionSet({ //QuestionSet
                        dbquizId: categoryId,
                        dbcategory: category,
                        dbquestions: questions
                        // createdAt will be set automatically
                    });
                    // Save the new question set to the database
                    const savedQuestionSet = await newQuestionSet.save();
                    existingCatgry.dbQuestions.push(savedQuestionSet._id);
                    await existingCatgry.save();
                    res.status(201).json({
                        message: 'Question set added successfully!',
                        questionSetId: savedQuestionSet._id // Return the ID of the created question set
                    });
                }
            }
            const isCollectionEmpty = await QuestionSet.countDocuments();
            console.log("Size of QuizSet collection", isCollectionEmpty);
            if (isCollectionEmpty == 0) {
                await QuestionSet.collection.drop();
                console.log("The QuizSet collection was empty and has been deleted.");
            } else {
                console.log("The QuizSet collection is not empty.");
            }
        // }
        // else {
        //     console.log("Admin access only");
        // }
    }
    catch (error) {
        console.log(error);
    }
})

//Score Updation

// quizEventEmitter.on('quizCompleted', async (data, callback) => {

//     console.log("Event received in admin:", data);
//     const { playerId, categoryId, score } = data;

//     console.log(`Updating score for Player ID: ${playerId} in Category ID: ${categoryId} with Score: ${score}`);

//     try {

//         const player = await Player.findOne({ dbUsername: playerId });
//         console.log("Player", player);

//         if (!player) {
//             console.log('Player not found');
//         }
//         else {

//             player.dbQuizHistory.push({
//                 categoryId: categoryId,
//                 score: score,
//                 date: new Date()
//             });
//             player.dbScores.push({
//                 quizId: categoryId,
//                 score: score,
//                 date: new Date()
//             });
//             player.dbTotalScore = (player.dbTotalScore || 0) + score;
//             await player.save();
//             console.log('Player score and history updated successfully in admin route!');
//             callback(null, 'Admin update successful');
//         }
//     }
//     catch (error) {
//         console.error('Error updating player data in admin:', error);
//         callback(error);
//     }
// })

//Delete QuestionSet
adminroute.delete('/deleteQuestionset/:ObjectId', authenticate, async (req, res) => {

    const loginRole = req.UserRole;
    try {
        if (loginRole == 'admin') {
            const { ObjectId } = req.params;
            console.log("DB Objid: ", ObjectId);

            const existingQuestion = await QuestionSet.findOne({ _id: ObjectId })
            console.log("Existing Questions:", existingQuestion);
            // console.log(existingQuestion.dbquizId);
            const existingCatgry = await QuizCatgry.findOne({ _id: existingQuestion.dbquizId })
            // console.log("Existing QuizCatg:",existingCatgry);
            console.log("Question exist:", existingCatgry.dbQuestions[0]);

            if (existingQuestion) {

                await QuestionSet.deleteOne({ _id: ObjectId })
                res.status(200).json({ message: "Questions Deleted" });
                console.log("Questions Deleted");
                // await QuizCatgry.findByIdAndDelete(existingCatgry.dbQuestions[0]);
                // console.log("Quiz category Deleted");
            }
            else {

                res.status(404).json({ message: "No Questionset Found" });
            }
        }
        else {
            console.log("Admin access only");

        }
    }
    catch (error) {
        console.log(error);
    }
})


export { adminroute }