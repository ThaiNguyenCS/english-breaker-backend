const {addDays} = require("date-fns")

function calculateNextDueDate (words)
{
    if(words)
    {
        for(let i = 0; i < words.length; i++)
        {
            words[i].learningTime++;
            words[i].dueDate = calculateDueDateFromNow(10);
        }
    }
    return []
}

function calculateDueDateFromNow (days)
{
    const dueDate = addDays(new Date(Date.now()), days);
    console.log(dueDate)
    return dueDate;
}

module.exports = {calculateNextDueDate}