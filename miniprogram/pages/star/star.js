// pages/star/star.js
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadFinish: false,
        currentIndex: 0,
        total: 0,

        question: null, // 题目object
        questionList: [], // 题目列表

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this._getList();
    },
    _getList() {
        const that = this;
        wx.cloud
            .callFunction({
                name: 'questionPool',
                data: {
                    type: 'getStar',
                }
            })
            .then((res) => {
                const {
                    questionList,
                    errCode,
                    errMsg
                } = res.result;
                if (errCode === 0) {
                    console.log(questionList)
                    const total = questionList.length;
                    const question = questionList[that.data.currentIndex];
                    that.setData({
                        questionList,
                        total,
                        question
                    });

                } else {
                    console.error(errMsg);
                    wx.showToast({
                        title: errMsg || '查询题目失败',
                        icon: 'error',
                    });
                }
            })
            .catch(console.error)
            .finally(() => {
                that.setData({
                    loadFinish: true,
                })
            })
    },

    goHome() {
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },
    goPrev() {
        const that = this;
        const newIndex = that.data.currentIndex - 1;

        if (newIndex < 0) {
            Toast.fail('已经是第一题');
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.setData({
            currentIndex: newIndex,
            question: tempQuestion
        })
    },

    goNext() {
        const that = this;

        const newIndex = that.data.currentIndex + 1; // 关键是改变页面的index

        if (newIndex > that.data.questionList.length - 1) {
            Toast.success("恭喜完成!");
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.setData({
            currentIndex: newIndex,
            question: tempQuestion
        });
    },
    removeStar() {
        const that = this;
        wx.cloud
            .callFunction({
                name: 'questionPool',
                data: {
                    type: 'removeStar',
                    questionId: that.data.question._id,
                }
            })
            .then((res) => {
                // console.log(res.result);
                const {
                    errMsg,
                    total
                } = res.result;
                if (errMsg === 'collection.remove:ok') { // 查询成功
                    let tempQuestion = that.data.question;
                    tempQuestion.stared = false; // 取消收藏
                    that.setData({ // 更新 question
                        question: tempQuestion,
                    });
                    Toast('取消收藏成功');
                } else {
                    Toa.error("取消收藏失败");
                }
            })
            .catch(console.error);
    },
    onItemClick(event) {

        const selectedValue = event.target.dataset.value;

        let tempQuestion = this.data.question;
        if (tempQuestion.showAnswer) {
            console.log("展示答案");
            return;
        }

        tempQuestion.userAnswer = this._collectAnswer(selectedValue, tempQuestion);


        this.setData({
            question: tempQuestion,
        })
    },
    onShowAnswer() {
        let tempQuestion = this.data.question;
        tempQuestion.showAnswer = true;
        this.setData({
            question: tempQuestion,
        });
    },
    _collectAnswer(selectedValue, tempQuestion) { // 收集答案函数
        switch (tempQuestion.type) {
            case 'radio':
                return [selectedValue];
            case 'checkbox':
                let currentAnswer = tempQuestion.userAnswer || []; // 判断当前用户是否已选答案
                if (currentAnswer.includes(selectedValue)) {
                    currentAnswer.splice(currentAnswer.indexOf(selectedValue), 1)
                } else {
                    currentAnswer.push(selectedValue);
                }
                return currentAnswer.sort(); // 若用户按照乱序选的，需要排序
        }
    },
    onShareAppMessage() {

    }
})