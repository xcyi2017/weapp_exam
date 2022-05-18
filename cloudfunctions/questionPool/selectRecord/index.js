const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
/*分页查询题目
 */
async function getPageData(event) {
    const queryResult = await db.collection('question')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
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
        };
    }
}

/*
 ** 随机查询题目列表
 */
async function getRandomList(event) {
    const queryResult = await db.collection('question')
        .aggregate()
        .sample({
            size: event.size,
        })
        .end();

    const {
        list: data,
        errMsg
    } = queryResult;

    if (errMsg === "collection.aggregate:ok") {
        return {
            errCode: 0,
            errMsg: errMsg,
            questionList: data,
        };
    } else {
        return {
            errCode: 1,
            errMsg: errMsg,
        };
    }
}

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
    // 返回数据库查询结果
    return getRandomList(event);
    // return getPageData(event);

};