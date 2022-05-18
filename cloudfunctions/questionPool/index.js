// 云函数入口文件
const addStar = require("./addStar/index");
const selectRecord = require("./selectRecord/index");
const checkStar = require("./checkStar/index");
const removeStar = require("./removeStar/index");
const collect = require("./collect/index");
const recordScore = require("./recordScore/index");
const getCollection = require("./getCollection/index");
const removeCollection = require("./removeCollection/index");
const getStar = require("./getStar/index");

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case "addStar":
            return await addStar.main(event, context);
        case 'selectRecord':
            return await selectRecord.main(event, context);
        case 'checkStar':
            return await checkStar.main(event, context);
        case 'removeStar':
            return await removeStar.main(event, context);
        case 'collect':
            return await collect.main(event, context);
        case 'recordScore':
            return await recordScore.main(event, context);
        case 'getCollection':
            return await getCollection.main(event, context);
        case 'removeCollection':
            return await removeCollection.main(event, context);
        case 'getStar':
            return await getStar.main(event, context);
    }

}