const mongoose = require('mongoose');
const SQLSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    SQLList: {type: Array}
});

const SQLModel = mongoose.model('sql', SQLSchema);

SQLModel.saveSQL = function (user_id, SQLList) {
    const newSQL = new SQLModel({
        user_id: user_id,
        SQLList: SQLList
    });
    newSQL.save();
    const modifiedData = {
        SQL_id: newSQL._id,
        user_id: newSQL.user_id,
        SQLList: newSQL.SQLList
    };
    return { status: 200, data: modifiedData };
};

SQLModel.deleteSQL = async function (SQL_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const SQLUserId = await SQLModel.find({ _id: new ObjectId(SQL_id) }, { user_id: 1 }).exec();
        if (!SQLUserId) {
            return { status: 404, message: 'SQL list not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (SQLUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        const deletedSQL = await SQLModel.findByIdAndDelete(SQL_id).exec();
        if (!deletedSQL) {
            return { status: 404, message: "SQL list not found" };
        }
        return { status: 200, message: "SQL list deleted successfully" };
    } catch (error) {
        console.error("Error deleting SQL:", error);
        return { status: 500, message: "An error occurred while deleting the SQL list" };
    }
};

SQLModel.deleteAllByUserId = async function (user_id) {
    try {
        const deleteResult = await SQLModel.deleteMany({ user_id }).exec();
        if (deleteResult.deletedCount === 0) {
            return { status: 404, message: "No SQL lists found for the user" };
        }
        return { status: 200, message: "All SQL lists deleted successfully" };
    } catch (error) {
        console.error("Error deleting SQL list:", error);
        return { status: 500, message: "An error occurred while deleting the SQL list" };
    }
};

SQLModel.findByUserId = async function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;

    const SQLs = await SQLModel.find({ user_id: new ObjectId(user_id) }, {user_id: 1, SQLList: 1}).exec();
    const modifiedData = SQLs.map(item => {
        const { _id, ...rest } = item.toObject(); // Use toObject() to convert Mongoose document to plain JavaScript object
        return { SQL_id: _id, ...rest };
    });
    return { status: 200, data: modifiedData };
};

SQLModel.findById = async function (SQL_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const SQLUserId = await SQLModel.find({ _id: new ObjectId(SQL_id) }, { user_id: 1 }).exec();
        if (SQLUserId.length == 0) {
            return { status: 404, message: 'SQL list not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (SQLUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        const SQLList = await SQLModel.findOne({ _id: new ObjectId(SQL_id)})
        const modifiedData = {
            SQL_id: SQLList._id,
            user_id: SQLList.user_id,
            SQLList: SQLList.SQLList
        }
        return { status: 200, data: modifiedData };
    }
    catch {
        console.error("Error finding the SQLList:", error);
        return { status: 500, message: "An error occurred while finding the SQLList" };
    }
};

SQLModel.modifySQLListById = async function (SQLList_id, user_id, SQLList) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const SQLUserId = await SQLModel.find({ _id: new ObjectId(SQLList_id) }, { user_id: 1 }).exec();
        if (SQLUserId.length == 0) {
            return { status: 404, message: 'SQLList not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (SQLUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }

        const updatedSQLList = await SQLModel.findByIdAndUpdate(
            SQLList_id,
            { $set: { SQLList:SQLList.SQLList } },
            { new: true }
        ).exec();
        if (!updatedSQLList) {
            return { status: 404, message: 'SQLList not found' };
        }

        return { status: 200 };
    } catch (error) {
        console.error("Error modifying SQLList of SQLList:", error);
        return { status: 500, message: "An error occurred while modifying SQLList of the SQLList" };
    }
};


module.exports = SQLModel;
