const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { auth } = require('../middleware/auth');

async function getTotalNumberOfExersises(){
    try{
        const { rows } = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM exercises
            WHERE audience IN ('Trainee', 'All')
            
            `
        );
        return parseInt(rows[0].total, 10);
    }catch(err){
        console.error("❌ Failed to fetch total number of exercises:", err);
        throw err;
    }
}

async function getTotalNumberOfScenarios(){
    try{
        const { rows } = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM scenarios
            `
        );
        return parseInt(rows[0].total, 10);
    }catch(err){
        console.error("❌ Failed to fetch total number of scenarios:", err);
        throw err;
    }
}

async function getCompletedExercisesCount(){
    try{
        
        const { rows } = await pool.query(`
            SELECT user_id, COUNT(*) AS completed_count
FROM exercise_submissions
GROUP BY user_id;
`);
return rows.reduce((acc, row) => {
    acc[row.user_id] = parseInt(row.completed_count, 10);
    return acc;
}, {});
    }catch(err){
        console.error("❌ Failed to fetch completed exercises count:", err);
        throw err;
    }
}



// GET /progress?user_ids[]=uuid1&user_ids[]=uuid2...
router.get('/', auth(['admin']), async (req, res) => {
    const userIds = req.query.user_ids || req.query['user_ids[]'];
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid user_ids' });
    }
    const totalExercises = await getTotalNumberOfExersises();
    console.log("Total exercises:", totalExercises);
    const totalScenarios = await getTotalNumberOfScenarios();
    console.log("Total scenarios:", totalScenarios);
    const completedExerciseCount = await getCompletedExercisesCount();
    console.log("Completed exercises count:", completedExerciseCount);
    

});

module.exports = router;