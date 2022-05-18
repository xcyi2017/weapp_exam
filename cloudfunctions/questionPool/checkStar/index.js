const cloud = require('wx-server-sdk');
const md5 = require('md5');


cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 添加收藏
exports.main = async (event, context) => {
    // 返回数据库查询结果

    const {
        questionId,
        userInfo
    } = event;


    const recordId = md5(questionId + userInfo.openId)
    return await db.collection('stared').where({
        _id: recordId
    }).count();
};