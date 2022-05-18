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

    if (total !== 0) { // 有错题存在
        const updateResult = await db.collection('collection')
            .doc(recordId)
            .update({
                data: {
                    idList: _.pull(questionId),
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
    } else { 
        return {
            errCode: 0,
            errMsg: "用户错题已清空",
        }
    }
}