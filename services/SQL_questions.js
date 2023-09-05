const SQLModel = require('../models/SQL_questions');

const find = function()
{
    return SQLModel.find()
}

const findById = function(id, user_id)
{
    return SQLModel.findById(id, user_id)
}

const findByUserId = function(user_id)
{
    return SQLModel.findByUserId(user_id)
}

const deleteById = async function(SQLList_id, user_id)
{
    try {
        const deletedSQL = await SQLModel.deleteSQL(SQLList_id, user_id);
        if (!deletedSQL) {
            return { status: 404, message: "SQLList not found" };
        }
        return { status: 200, message: "SQLList deleted successfully" };
    } catch (error) {
        console.error("Error deleting SQLList:", error);
        return { status: 500, message: "An error occurred while deleting the SQLList" };
    }
}

const deleteAllByUserId = async function(user_id)
{
    try {
        const deletedSQLs = await SQLModel.deleteAllByUserId(user_id);
        if (!deletedSQLs) {
            return { status: 404, message: "SQLList not found" };
        }
        return { status: 200, message: "SQLList deleted successfully" };
    } catch (error) {
        console.error("Error deleting SQLList:", error);
        return { status: 500, message: "An error occurred while deleting the SQLList" };
    }
}

const modifySQLListById = function(SQLList_id, user_id, SQLList)
{
    return SQLModel.modifySQLListById(SQLList_id, user_id, SQLList)
}

const save = function(SQLList)
{
    return SQLModel.saveSQL(SQLList);
}

module.exports = {
    find,
    findById,
    findByUserId,
    deleteById,
    deleteAllByUserId,
    modifySQLListById,
    save
}
