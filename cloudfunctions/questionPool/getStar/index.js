const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
// 添加收藏
exports.main = async (event, context) => {

    console.log(event);
    const queryResult = await db.collection('stared')
        .where({
            openId: event.userInfo.openId
        })
        .get();

    const {
        data,
        errMsg
    } = queryResult;

    if (errMsg === 'collection.get:ok') {
        return {
            errCode: 0,
            errMsg: errMsg,
            questionList: data,
        };
    } else {
        return {
            errCode: 1,
            errMsg: errMsg,
        }
    }
};