const cloud = require('wx-server-sdk');


cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 添加错题本
exports.main = async (event, context) => {
    // 返回数据库查询结果

    const {
        questionId,
        userInfo
    } = event;

    const recordId = userInfo.openId; // 用openId做唯一标识
    const countResult = await db.collection('collection')
        .where({
            _id: recordId
        })
        .count();
    console.log(countResult);
    const {
        errMsg,
        total
    } = countResult;

    if (errMsg !== 'collection.count:ok') {
        return {
            errCode: 1,
            errMsg: errMsg,
        };
    }

    if (total !== 0) { // 更新
        const updateResult = await db.collection('collection')
            .doc(recordId)
            .update({
                data: {
                    idList: _.addToSet(questionId),
                }
            });
        console.log(updateResult);
        const {
            errMsg
        } = updateResult;
        if (errMsg === 'document.update:ok') {
            return {
                errCode: 0,
                errMsg: "ok",
            }
        } else {
            return {
                errCode: 2,
                errMsg: errMsg,
            }
        }
    } else { // 插入，添加
        const addResult = await db.collection('collection')
            .doc(recordId)
            .set({
                data: {
                    idList: [questionId],
                }, // 不能直接写questionId
            });
        console.log(addResult);

        const {
            errMsg
        } = addResult;
        if (errMsg == "document.set:ok") {
            return {
                errCode: 0,
                errMsg: "ok",
            }
        } else {
            return {
                errCode: 3,
                errMsg: errMsg,
            }
        }
    }
}