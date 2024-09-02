const { database } = require("./database");

const getActiveDays = async (userID) => {
    if(userID)
    {
        const QUERY = `SELECT DISTINCT date(h.startingTime) as activeDay FROM ${process.env.DB_TABLE_TEST_HISTORIES} h WHERE userID = ?`;
        try {
            const [result] = await database.execute(QUERY, [userID]);
            console.log(result)
            const formattedResult = []
            if(result.length > 0)
            {
                for(let i = 0; i < result.length; i++)
                {
                    let convertedDay = new Date(result[i].activeDay);
                    formattedResult.push({
                        year: convertedDay.getFullYear(),
                        month: convertedDay.getMonth(), 
                        date: convertedDay.getDate(), 
                    })
                }
            }

            return {result: true, data: formattedResult};
        } catch (error) {
            console.log(error);
            return {result: false, error}
        }
    }
}

module.exports = {getActiveDays};