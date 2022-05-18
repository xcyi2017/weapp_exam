// pages/exam/exam.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        currentIndex: 0,
        total: 0,

        question: null, // 题目object
        questionList: [], // 题目列表

        finish: false, // 答题完成与否
        score: 0,
        correctCount: 0,
        wrongCount: 0
    },
    addStar() {
        const that = this;
        const {showAnswer, stared, userAnswer, ...questionForStar} = that.data.question;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: "addStar",
                    question: questionForStar,
                }
            })
            .then((res) => {
                console.log(that.data.question);
                const {
                    errMsg
                } = res.result;
                if (errMsg === 'document.set:ok') {
                    let tempQuestion = that.data.question;
                    tempQuestion.stared = true;
                    that.setData({
                        question: tempQuestion,
                    });
                    wx.showToast({
                        title: '收藏成功',
                        icon: 'success',
                        duration: 2000,
                    });
                } else {
                    wx.showModal({
                        title: '收藏失败',
                        content: errMsg,
                        showCancel: false,
                    });
                }
            })
            .catch(console.error);
    },

    checkStar(questionId) {
        const that = this;
        wx.cloud
            .callFunction({
                name: 'questionPool',
                data: {
                    type: 'checkStar',
                    questionId: questionId,
                }
            })
            .then((res) => {
                // console.log(res.result);
                const {
                    errMsg,
                    total
                } = res.result;
                if (errMsg === 'collection.count:ok') { // 查询成功
                    let tempQuestion = that.data.question;
                    tempQuestion.stared = total > 0; // 添加收藏
                    that.setData({ // 更新 question
                        question: tempQuestion,
                    })
                } else {
                    console.warn('查询收藏夹失败');
                }
            })
            .catch(console.error);
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
                    wx.showToast({
                        title: '取消收藏成功',
                        icon: "success",
                        duration: 2000
                    })
                } else {
                    wx.showModal({
                        title: "取消收藏失败",
                        content: errMsg,
                        showCancle: false
                    })
                }
            })
            .catch(console.error);
    },
    getList() {
        const that = this;
        wx.cloud
            .callFunction({
                name: "questionPool",
                data: {
                    type: 'selectRecord',
                    page: 1,
                    size: 5,
                }
            })
            .then(res => {
                console.log(`${JSON.stringify(res)}->获得题目列表`);
                const {
                    questionList,
                    errMsg,
                    errCode
                } = res.result;
                if (errCode === 0) {
                    const total = questionList.length;
                    const question = questionList[that.data.currentIndex];
                    this.checkStar(question._id);
                    that.setData({
                        questionList,
                        total,
                        question
                    });

                } else {
                    console.error(errMsg);
                    wx.showToast({
                        title: '查询题目失败',
                        icon: "error",
                    })
                }
            })
            .catch(
                console.error
            )
    },
    onShowAnswer() {
        let tempQuestion = this.data.question;
        tempQuestion.showAnswer = true;
        this.setData({
            question: tempQuestion,
        });
        this.addCollection();
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getList();
    },

    goPrev() {
        const that = this;
        const newIndex = that.data.currentIndex - 1;

        if (newIndex < 0) {
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.checkStar(tempQuestion._id);
        that.setData({
            currentIndex: newIndex,
            question: tempQuestion
        })
    },

    goNext() {
        const that = this;
        // 
        // if (!that.data.question.userAnswer) {
        //     console.log(`用户还未回答，不跳转`);
        //     wx.showToast({
        //       title: '请先回答本题',
        //       icon: 'none',
        //     })
        //     return;
        // }

        // 切换前，验证是否答错并加入错题集
        that.addCollection();
        const newIndex = that.data.currentIndex + 1; // 关键是改变页面的index

        if (newIndex > that.data.questionList.length - 1) {
            console.log("已经是最后一题了");
            return;
        }
        const tempQuestion = that.data.questionList[newIndex];
        that.checkStar(tempQuestion._id);
        that.setData({
            currentIndex: newIndex,
            question: tempQuestion
        });
    },

    goResult() { // 到达结果页
        const that = this;
        // 计算答对的题目数
        const correctCount = that.data.questionList.reduce((val, cur) => {
            if (that._isCorrect(cur)) {
                val++;
            }
            return val;
        }, 0);
        // 计算答错的题目数

        const wrongCount = that.data.questionList.reduce((val, cur) => {
            if (!that._isCorrect(cur)) {
                val++;
            }
            return val;
        }, 0);
        // 计算分数
        const score = Math.round(correctCount * 100 / that.data.total);

        that._recordScore(score);

        that.setData({
            correctCount,
            wrongCount,
            score,
            finish: true,
        });
    },

    _recordScore(score) {
        // const that = this;
        wx.cloud
            .callFunction({
                name: 'questionPool',
                data: {
                    type: 'recordScore',
                    score: score,
                }
            })
            .then((res) => {
                console.log(`${res}->分数请求`);
                const {
                    errCode,
                    errMsg
                } = res.result;
                if (errCode === 0) {
                    console.log(`已记录用户分数：${score}`);
                } else {
                    console.error(errMsg);
                }
            })
            .catch(console.error);
    },

   

    _isCorrect(question) {
        console.log(`${question}改题目是否正确？`);
        // 如果用户没回答也判错
        if (!question.userAnswer) {
            return false;
        }
        return question.answer.sort().join() === question.userAnswer.sort().join();

    },

    addCollection() {
        const that = this;
        let tempQuestion = that.data.question;

        if (!tempQuestion.userAnswer) {
            console.log(`${tempQuestion.title}用户还未回答，不加错题本逻辑`);
            return;
        }

        if (that._isCorrect(tempQuestion)) {
            console.log(`${tempQuestion.title}用户答对了，不加错题本逻辑`);
            return;
        }
        // 通过云函数添加到错题本
        wx.cloud
            .callFunction({
                name: 'questionPool',
                data: {
                    type: 'collect',
                    questionId: tempQuestion._id,
                }
            })
            .then((res) => {
                const {
                    errCode,
                    errMsg
                } = res.result;
                if (errCode === 0) {
                    wx.showToast({
                        title: '已加入错题本',
                        icon: 'none',
                    });
                    console.log(`${tempQuestion.title}已加入错题本`)
                } else {
                    console.error(errMsg);
                }
                console.log(res);
            })
            .catch(console.error);
    },
    goCollection() {
        wx.redirectTo({
            url: '/pages/collection/collection',
        })
    },
    goHome() {
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})