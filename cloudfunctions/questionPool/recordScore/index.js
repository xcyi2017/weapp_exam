const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 记录分数
exports.main = async (event, context) => {
    // 返回数据库查询结果
    const {
        score,
        userInfo
    } = event;

    const addResult = await db.collection('histroy').add({
        data: {
            openId: userInfo.openId,
            score: score,
            createTime: db.serverDate(),
        }
    });

    if (addResult.errMsg === 'collection.add:ok') {
        return {
            errCode: 0,
            errMsg: "ok"
        }
    } else {
        return {
            errCode: 1,
            errMsg: addResult.errMsg,
        }
    }
};