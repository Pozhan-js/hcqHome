/*
 * @Author: hcq
 * @Date: 2021-08-02 14:15:49
 * @LastEditTime: 2021-08-02 15:06:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @version:1.0
 * @FilePath: https://gitee.com/hcqHome/zjyScript
 */
(() => {

    let url = {
            login: `https://zjy2.icve.com.cn/portal/login.html`,
            userInfo: `https://zjy2.icve.com.cn/api/student/Studio/index`,
            getLearnningCourseLists: `https://zjy2.icve.com.cn/api/student/learning/getLearnningCourseList`,
            getProcessLists: `https://zjy2.icve.com.cn/api/study/process/getProcessList`,
            getTopicByModuleIds: `https://zjy2.icve.com.cn/api/study/process/getTopicByModuleId`,
            getCellByTopicIds: `https://zjy2.icve.com.cn/api/study/process/getCellByTopicId`,
            viewDirectorys: `https://zjy2.icve.com.cn/api/common/Directory/viewDirectory`,
            stuProcessCellLog: `https://zjy2.icve.com.cn/api/common/Directory/stuProcessCellLog`,
            changeStuStudyProcessCellData: `https://zjy2.icve.com.cn/api/common/Directory/changeStuStudyProcessCellData`
        },
        speed = 2000, //执行速度
        ajaxSpeed = speed, //ajax发送与内容添加速度
        isPause = 1,
        errorNum = 0, //错误次数
        pauseNode = "", //存放暂停函数节点
        domRequestSpeed = speed, //文档请求速度
        videoRequestSpeed = 10000, //视频请求速度
        videoAddSpeed = 15, //视频增加速度
        nowCourseObj = {
            index: 0, //当前课程索引
            courseName: "", //课程名字
            courseOpenId: "", //课程Id
            openClassId: "", //班级ID
            openCourseCellCount: 0, //课程内容总数
            moduleId: "", //组件id
            unCourseList: [], //待完成课程列表
            temporaryList: [], //临时列表(用于存放已经读取过的信息)
            temporaryIndex: 0, //临时索引(用于重新加载模块后从该索引开始继续获取信息)
            viewDirectory: {} //临时存放viewDirectory的数据
        },
        style = /*模块样式*/ `
        #hcq-content {
            position: fixed;
            width: 90%;
            height: 90%;
            left: 0;
            top: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            background: linear-gradient(to right, #6A82FB, #FC5C7D);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            box-shadow: 0 0 5px #666;
            z-index: 999
        }
        
        #hcq-content>div {
            z-index: 1;
        }
        
        #hcq-content-left,
        #hcq-content-right {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: all .35s;
        }
        
        #hcq-content-left {
            width: 180px;
            box-shadow: 1px 0 6px #666;
            background: linear-gradient(to right, #6A82FB -250%, #fff 800%);
            left: 0;
        }
        
        #hcq-content-right {
            background-color: rgba(255, 255, 255, 0.5);
        }
        
        #hcq-content-left>img {
            width: 120px;
            height: 120px;
            background-color: rgba(255, 255, 255, 0.5);
            margin: 20px auto;
            border-radius: 5px;
            object-fit: cover;
        }
        .user-name,
        .stuNum {
            background-color: rgba(255, 255, 255, .75);
        }
        .left-item {
            position: relative;
            margin: .5rem 0;
            text-align: center;
        }
        
        .left-item>span,
        .menu-item>span {
            display: block;
        }
        
        .text-ellipsis {
            padding: .5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        #hcq-main {
            flex: 1;
            z-index: -2 !important;
        }
        
        #console-info {
            position: relative;
            width: 90%;
            height: 90%;
            left: 5%;
            top: 5%;
            border-radius: 5px;
            overflow: auto;
            background-color: rgba(255, 255, 255, .75);
            scroll-behavior: smooth;
        }
        
        #console-info span {
            display: block;
            border-bottom: 1px dashed #2ECD71;
        }
        
        #console-info::-webkit-scrollbar {
            width: 12px;
        }
        
        #console-info::-webkit-scrollbar:hover {
            background-color: rgba(0, 0, 0, 0.2);
        }
        
        #console-info::-webkit-scrollbar-thumb {
            background-color: #6A82FB;
            border-radius: 5px;
        }
        
        #hcq-content-right {
            width: 260px;
            box-shadow: -1px 0 6px #666;
            right: 0;
        }
        
        .btn {
            position: relative;
            top: 140px;
            padding: .5rem;
            margin: 0 .5rem;
            border-radius: 5px;
            overflow: hidden;
            cursor: pointer;
            background-color: rgba(255, 255, 255, .8);
            box-shadow: 0 0 0 1em transparent;
            user-select: none;
            transition: all .25s;
        }
        
        .btn[on=on] {
            animation: pulse 1s;
        }
        
        .btn>span {
            position: relative;
            z-index: 1;
        }
        
        .btn:hover {
            color: #fff !important;
            background-color: rgba(255, 255, 255, .2);
        }
        
        .switch-platform {
            --color: #6A82FB;
            border: 1px solid #6A82FB;
            color: #6A82FB;
        }
        
        .switch-platform[show=on] {
            background-color: #6A82FB;
            color: #fff
        }
        
        #hcq-content .mian-run {
            --color: #2ECD71;
            border: 1px solid #2ECD71;
            color: #2ECD71;
        }
        
        #hcq-content .mian-run[type=paused] {
            --color: #ee5d5c;
            border: 1px solid#ee5d5c;
            color: #ee5d5c;
        }
        
        #hcq-content .mian-run::after,
        .switch-platform::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            transform: scaleX(0);
            z-index: -1;
            transition: transform .35s;
        }
        
        .switch-platform::after,
        #hcq-content .mian-run::after {
            background-color: var(--color);
        }
        
        @keyframes pulse {
            from {
                box-shadow: 0 0 0 0 var(--color);
            }
        }
        
        #hcq-content .mian-run:hover::after,
        .switch-platform:hover::after {
            transform: scaleX(1);
        }
        
        .switch-box {
            position: absolute;
            z-index: -1 !important;
            width: 180px;
            height: 100%;
            left: -180px;
            transition: all .35s;
            background-color: rgba(255, 255, 255, .8);
            box-shadow: 0 0 5px #666;
        }
        
        .switch-box>ul {
            list-style: none;
            padding: 0;
        }
        
        .switch-box li {
            cursor: pointer;
            text-align: center;
            margin: .2rem;
            padding: .5rem;
            border: #6A82FB 1px solid;
            transition: all .35s;
        }
        
        .switch-box li[on=on] {
            background-color: #6A82FB;
        }
        
        .left-btn,
        .right-btn {
            display: none;
            width: 1.5rem;
            height: 100%;
            align-items: center;
            background-color: #0aec6960;
            cursor: pointer;
            user-select: none;
        }
        
        .left-btn>span,
        .right-btn>span {
            display: block;
            font-size: 1.5rem;
            transition: all .35s;
        }
        
        .menu-item {
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            margin: .5rem .2rem;
            margin-bottom: 0;
            box-shadow: 0 0 5px #666;
            background-color: rgba(0, 0, 0, 0.2);
        }
        
        .menu-item>span {
            padding: .5rem 0;
        }
        
        .menu-item input[type=text] {
            width: 60px;
            margin: 0 .2rem;
            text-align: center;
        }
        
        @media all and (max-width:1148px) {
            .right-btn {
                position: absolute;
                display: flex;
                margin-left: -1.5rem;
            }
            #hcq-content-right>.right-btn>span {
                transform: rotate(0);
            }
            #hcq-content-right[on=on]>.right-btn>span {
                transform: rotate(180deg);
            }
            #hcq-content-right[on=on] {
                right: 0;
            }
            #hcq-content-right {
                position: absolute;
                right: -260px;
            }
        }
        
        @media all and (max-width:768px) {
            .left-btn {
                display: flex;
                position: absolute;
            }
            #hcq-content-left {
                left: -180px;
            }
            #hcq-content-left {
                position: absolute;
            }
            #hcq-content-left[on=on] {
                left: 0;
            }
            #hcq-content-left+.left-btn>span {
                transform: rotate(0);
            }
            #hcq-content-left[on=on]+.left-btn>span {
                transform: rotate(180deg);
            }
        }
        
        @media all and (max-width:480px) {
            #console-info {
                width: 100%;
                height: 90%;
                left: 0;
            }
        }
        `,
        divs = /*模块节点*/ `
        <div id="hcq-content">
        <div id="hcq-content-left">
            <img src="http://q1.qlogo.cn/g?b=qq&nk=2533094475&s=640" alt="用户头像">
            <div class="left-item">
                <span>用户名</span>
                <span class="user-name text-ellipsis">2533094475</span>
            </div>
            <div class="left-item">
                <span>学号</span>
                <span class="stuNum text-ellipsis">2533094475</span>
            </div>
            <div class="left-item">
                <div class="switch-platform btn">
                    <span>切换平台</span>
                </div>
            </div>
            <div class="left-item">
                <div class="mian-run btn">
                    <span>运行</span>
                </div>
            </div>
        </div>
        <div class="left-btn">
            <span>></span>
        </div>
        <div class="switch-box">
            <ul>
                <li on=on>职教云</li>
                <li>学习通</li>
                <li>暂时还不支持切换，持续更新中</li>
            </ul>
        </div>
        <div id="hcq-main">
            <div id="console-info">
                <div></div>
            </div>
        </div>
        <div id="hcq-content-right">
            <div class="right-btn">
                <span>&#60</span>
            </div>
            <div class="menu-item">
                <span>请求发送速度</span>
                <div>
                    [<input type="text" placeholder="1-4" data-default="2" id="ajax-set" value="2">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>文档修改速度</span>
                <div>
                    [<input type="text" placeholder="1-4" data-default="2" id="dom-set" value="2">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>视频修改速度</span>
                <div>
                    [<input type="text" placeholder="8-15" data-default="10" id="video-set" value="10">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>视频修改时间</span>
                <div>
                    [视频当前进度+<input type="text" id="video-time-set" data-default="15" placeholder="12-22" value="15">秒]
                </div>
            </div>
            <div class="menu-item">
                <span style="color:red;">修改速度过快可能导致被检测而异常</span>
                <span style="color:red;">已限定修改范围，请酌情修改</span>
            </div>
        </div>
    </div>
        `

    function ajaxPost(url, date) {
        return new Promise((res, rej) => {
            setTimeout(() => {
                if (isPause == 0) {
                    rej("已暂停运行");
                } else {
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: date,
                        dataType: "json",
                        success: function(data) {
                            res(data);
                        },
                        error: function(xhr) {
                            rej(xhr);
                        }
                    })
                }
            }, ajaxSpeed)
        })
    }

    function setNowCourseObj({ //赋值解构对对象赋值
        courseName,
        courseOpenId,
        openClassId,
        openCourseCellCount,
        moduleId
    }) {
        nowCourseObj.courseName = courseName;
        nowCourseObj.courseOpenId = courseOpenId;
        nowCourseObj.openClassId = openClassId;
        nowCourseObj.openCourseCellCount = openCourseCellCount;
        nowCourseObj.moduleId = moduleId;
    }

    function setError(e, fn) {
        console.error(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);
        errorNum++;
        setTimeOut(() => {
            if (errorNum > 3) {
                console.error(`获取课程失败，请刷新后在重试`);
                pauseNode = fn;
            } else {
                Console(`正在尝试重新获取第${errorNum}次`);
                fn();
            }
        })
    }
    if (document.querySelector("#hcq-content") == null) {
        $("head>style").eq(0).append(style);
        $("body").eq(0).append(divs);
    }
    $(function() {
        let $btn = $(".btn"),
            $switchBtn = $(".switch-platform").eq(0),
            switchBox = document.querySelector(".switch-box");
        $switchBoxLis = $(switchBox).find("li"),
            $contentLeft = $("#hcq-content-left"),
            $contentRight = $("#hcq-content-right"),
            $leftBtn = $(".left-btn"),
            $rightBtn = $(".right-btn"),
            $consoleInfo = $("#console-info"),
            $consoleInfoItem = $consoleInfo.children("div"),
            $run = $(".mian-run"),
            $speedSet = $contentRight.find("input[type=text]");
        async function getCourseLists() { //获取课程列表
            try {
                if (nowCourseObj.unCourseList.length != 0) {
                    setNowCourseObj(nowCourseObj.unCourseList[++nowCourseObj.index])
                    getProcessLists();
                } else {
                    Console('正在获取课程列表中');
                    let data = await ajaxPost(url["getLearnningCourseLists"]),
                        List = data.courseList,
                        finished = 0,
                        unfinishedList = [];
                    setTimeOut(() => {
                        Console(`获取到课程列表${List.length}门`);
                        List.forEach(e => {
                            if (e.process != 100) {
                                unfinishedList.push({
                                    courseName: e.courseName,
                                    courseOpenId: e.courseOpenId,
                                    openClassId: e.openClassId,
                                    process: e.process
                                })
                            } else {
                                finished++;
                            }
                        });
                        nowCourseObj.unCourseList = unfinishedList;
                        setTimeOut(() => {
                            Console(`其中已完成课程有${finished}门课程，未完成课程为${List.length-finished}门课程`);
                            setTimeOut(() => {
                                errorNum = 0;
                                setNowCourseObj(unfinishedList[nowCourseObj.index])
                                getProcessLists();
                            });
                        });
                    });
                }
            } catch (e) {
                setError(e, getCourseLists);
            }
        }
        async function getProcessLists() { //获取列表进度
            try {

                Console(`当前课程名称${nowCourseObj.courseName}`)
                let data = await ajaxPost(url["getProcessLists"], {
                        courseOpenId: nowCourseObj.courseOpenId,
                        openClassId: nowCourseObj.openClassId
                    }),
                    sourseSum = data.openCourseCellCount,
                    list = data.progress.moduleList,
                    unfinishedList = [],
                    finished = 0;
                nowCourseObj.openCourseCellCount = sourseSum;
                nowCourseObj.moduleId = data.progress.moduleId;
                setTimeOut(() => {
                    Console(`成功获取到列表进度信息，本课程有${list.length}大模块，共计${sourseSum}个小节`);
                    list.forEach(e => {
                        if (e.percent != 100) {
                            unfinishedList.push({
                                id: e.id,
                                name: e.name,
                                percent: e.percent
                            })
                        } else {
                            finished++;
                        }
                    });
                    nowCourseObj.temporaryList = unfinishedList;
                    setTimeOut(() => {
                        Console(`其中已完成${finished}个模块，未完成${list.length-finished}个模块`);
                        setTimeOut(() => {
                            errorNum = 0;
                            getTopicByModuleIds();
                        });
                    });
                });
            } catch (e) {
                setError(e, getProcessLists);
            }
        }
        async function getTopicByModuleIds() {
            try {
                Console(`准备获取本课程小节信息`);
                let List = [],
                    index = nowCourseObj.temporaryIndex,
                    module = nowCourseObj.temporaryList;
                if (index != 0) {
                    Console(`正在重新获取进度`);
                }
                Console(await new Promise(r => { setTimeOut(() => { r(`正在获取本课程小节信息`) }) }));
                for (let [i, e] of module.entries()) {
                    if (i >= index) {
                        let res = await ajaxPost(url["getTopicByModuleIds"], {
                            courseOpenId: nowCourseObj.courseOpenId,
                            moduleId: e.id
                        });
                        nowCourseObj.temporaryIndex = ++index;
                        Console(`获取进度${index}/${module.length}`);
                        let obj = []
                        res.topicList.forEach(item => {
                            item.moduleId = e.id;
                            obj.push(item);
                        });
                        List.push(...obj);
                    }
                }
                errorNum = 0;
                nowCourseObj.temporaryIndex = 0;
                setTimeOut(() => {
                    nowCourseObj.temporaryList = List;
                    getCellByTopicIds();
                })
            } catch (e) {
                setError(e, getTopicByModuleIds);
            }
        }
        async function getCellByTopicIds() {
            try {
                Console(`已获取本课程组件列表`);
                Console(await new Promise(r => { setTimeOut(() => { r(`准备获取课程组件节点`) }) }));
                let nodeList = [],
                    index = nowCourseObj.temporaryIndex,
                    List = nowCourseObj.temporaryList;
                if (index != 0) {
                    Console(`正在重新获取进度`);
                }
                for (let [i, e] of List.entries()) {
                    if (i >= index) {
                        let res = await ajaxPost(url["getCellByTopicIds"], {
                            courseOpenId: nowCourseObj.courseOpenId,
                            openClassId: nowCourseObj.openClassId,
                            topicId: e.id
                        });
                        nowCourseObj.temporaryIndex = ++index;
                        Console(`获取进度${index}/${List.length}`);
                        let obj = []
                        res.cellList.forEach(item => {
                            item.moduleId = e.moduleId;
                            obj.push(item);
                        });
                        nodeList.push(...obj);
                    }
                }
                errorNum = 0;
                nowCourseObj.temporaryList = [];
                nowCourseObj.temporaryIndex = 0;
                setTimeOut(() => {
                    Console(`成功获取到所有组件节点`);
                    setTimeOut(() => {
                        Console(`正在对未完成小节进行筛选`);
                        let unfinishedList = [];
                        nodeList.forEach(e => {
                            if (e.stuCellPercent != 100) {
                                unfinishedList.push({
                                    id: e.Id,
                                    moduleId: e.moduleId,
                                    categoryName: e.categoryName,
                                    cellName: e.cellName,
                                    childNodeList: e.childNodeList
                                })
                            }
                        });
                        nowCourseObj.temporaryList = unfinishedList;
                        setTimeOut(() => {
                            Console(`筛选完成,共计未完成小节${unfinishedList.length}个`);
                            setTimeOut(() => {
                                viewDirectorys();
                            })
                        })
                    });
                });
            } catch (e) {
                setError(e, getCellByTopicIds);
            }
        }

        async function viewDirectorys() {
            try {
                let index = nowCourseObj.temporaryIndex,
                    List = nowCourseObj.temporaryList;
                Console(`准备获取当前小节`);
                for (let [i, e] of List.entries()) {
                    if (i >= index) {
                        if (e.categoryName == "子节点") {
                            let is = 0;
                            for (let v of e.childNodeList) {
                                nowCourseObj.viewDirectory = {
                                    courseOpenId: nowCourseObj.courseOpenId,
                                    openClassId: nowCourseObj.openClassId,
                                    cellId: v.Id,
                                    flag: "s",
                                    moduleId: e.moduleId
                                }
                                let re = await ajaxPost(url["viewDirectorys"], nowCourseObj.viewDirectory);
                                Console(`获取进度[${++is}/${e.childNodeList.length}][${index}/${List.length}]`);
                                if (re.cellPercent != 100) {
                                    await stuProcessCellLog(re);
                                }
                            }
                        } else {
                            nowCourseObj.viewDirectory = {
                                courseOpenId: nowCourseObj.courseOpenId,
                                openClassId: nowCourseObj.openClassId,
                                cellId: e.id,
                                flag: "s",
                                moduleId: e.moduleId
                            }
                            let res = await ajaxPost(url["viewDirectorys"], nowCourseObj.viewDirectory);
                            nowCourseObj.temporaryIndex = ++index;
                            Console(`获取进度${index}/${List.length}`);
                            if (res.cellPercent != 100) {
                                await stuProcessCellLog(res);
                            }
                        }
                    }
                }
                Console(`本章节成功完成`);
                ajaxSpeed = speed;
                if (nowCourseObj.index >= nowCourseObj.unCourseList.length) {
                    setTimeOut(() => {
                        Console(`所有课件成功完成`);
                    })
                } else {
                    getCourseLists();
                }

            } catch (e) {
                setError(e, viewDirectorys);
            }
        }

        async function stuProcessCellLog(res) {
            if (res.code == -100) {
                let date = await ajaxPost(url["changeStuStudyProcessCellData"], {
                    courseOpenId: res.currCourseOpenId,
                    openClassId: res.currOpenClassId,
                    moduleId: res.currModuleId,
                    cellId: res.curCellId,
                    cellName: res.currCellName,
                });
                if (date.code == 1) {
                    let r = await ajaxPost(url["viewDirectorys"], nowCourseObj.viewDirectory);
                    res = r;
                }
            }
            let name = res.categoryName,
                len = 0,
                type = 0,
                newTime = res.stuStudyNewlyTime;
            if (name == "视频" || name == "音频") {
                len = res.audioVideoLong;
            } else {
                len = res.pageCount;
            }
            Console(`当前小节 类型:[${name}] 名称:[${res.cellName}] 长度:[${len}]`);
            try {
                switch (name) {
                    case "ppt文档":
                    case "pdf文档":
                    case "office文档":
                    case "excel文档":
                        type = 1;
                        ajaxSpeed = domRequestSpeed;
                        break;
                    case "视频":
                    case "音频":
                        type = Math.round((len - Math.round(newTime)) / videoAddSpeed);
                        ajaxSpeed = videoRequestSpeed;
                        break;
                    default:
                        Console(`类型暂时未记录！已跳过`);
                        break;
                }

            } catch (e) {
                Console(`修改异常:${e}`)
            }
            if (type != 0) {
                let time = 0,
                    sp = videoAddSpeed;
                for (let i = 1; i <= type; i++) {
                    if (type > 1) {
                        time = parseInt((sp * i) + newTime);
                        if ((time + sp) >= len) {
                            time = len;
                        }
                    }
                    let r = await ajaxPost(url["stuProcessCellLog"], {
                        courseOpenId: nowCourseObj.courseOpenId,
                        openClassId: nowCourseObj.openClassId,
                        cellId: res.cellId,
                        cellLogId: res.cellLogId,
                        picNum: res.pageCount,
                        studyNewlyPicNum: res.stuStudyNewlyPicCount,
                        studyNewlyTime: time,
                        token: res.guIdToken,
                    });
                    r.code >= 1 ? Console(`${r.msg},本节进度${i}/${type}`) : Console(`修改失败！错误码为${r.code},错误信息${r.msg}`);
                    if (/^.*分钟.*禁.*$/gu.test(r.msg) || /刷课/gu.test(r.msg)) {
                        throw Console(`账户疑似异常，已终止执行`);
                    }
                }
                Console(`本小节已完成！`)
                ajaxSpeed = speed;
            }
            return Promise.resolve(0);
        }

        function Console(text) {
            $consoleInfoItem.append(`
            <span class="text-ellipsis ">${text}</span>
            `);
            $consoleInfo.scrollTop($consoleInfoItem.height());
        }

        function setTimeOut(fn) {
            setTimeout(() => {
                fn()
            }, 1000);
        }

        async function main() {
            Console("查询用户信息中。。。请稍后")
            try {
                let res = await ajaxPost(url["userInfo"]);
                if (res == "" || /token=.*^/.test(document.cookie)) {
                    alert("请登录后再执行该脚本！");
                    setTimeOut(() => {
                        window.location.href = url["login"];
                    });
                } else {
                    $contentLeft.children("img").attr("src", res.avator);
                    $contentLeft.find(".user-name").text(res.UserName);
                    $contentLeft.find(".stuNum").text(res.stuNo);
                    Console(`[${res.disPlayName}]用户您好，欢迎━(*｀∀´*)ノ亻!使用本脚本，正在持续更新中。`)
                    Console(`如在使用过程中出现BUG等情况,可反馈给作者<a href="tencent://message/?uin=2533094475&Site=admin5.com&Menu=yes">点我联系</a>`)
                }
            } catch (e) {
                alert(`错误原因${e},请登录后再执行该脚本！`);
                setTimeOut(() => {
                    window.location.href = url["login"];
                });
            }
        }
        main();
        $btn.click(function() {
            if ($(this).attr("on") == null) {
                $(this).attr("on", "on");
                setTimeout(() => {
                    $(this).removeAttr("on");
                }, 1000);
            }
        });
        $speedSet.blur(function() {
            let v = $(this).val().replace(/\s*/g, ""),
                area = $(this).attr("placeholder"),
                reg = /^(?<min>\d*)-(?<max>\d*)/.exec(area),
                min = +reg.groups.min,
                max = +reg.groups.max,
                setV = +$(this).data("default"),
                id = $(this).attr("id");
            if (v != "") {
                v = +v;
                if (typeof v == "number" && v >= min && v <= max) {
                    setV = v;
                }
            }
            switch (id) {
                case "ajax-set":
                    ajaxSpeed = 1000 * setV;
                    speed = ajaxSpeed;
                    Console(`请求发送速度修改成功,当前速度${ajaxSpeed/1000}s`);
                    break;
                case "dom-set":
                    domRequestSpeed = 1000 * setV;
                    Console(`文档修改速度修改成功,当前速度${domRequestSpeed/1000}s`);
                    break;
                case "video-set":
                    videoRequestSpeed = 1000 * setV;
                    Console(`视频修改速度修改成功,当前速度${videoRequestSpeed/1000}s`);
                    break;
                case "video-time-set":
                    videoAddSpeed = setV;
                    Console(`视频增加修改成功,当前速度${videoAddSpeed}s,下一个视频后生效`);
                    break;
                default:
                    Console("速度修改失败");
                    break;
            }
            $(this).val(setV);
        });
        $switchBtn.on("click", function() {
            if ($(this).attr("show") != null) {
                $(this).removeAttr("show");
                switchBox.style.left = "-180px";
            } else {
                $(this).attr("show", "on");
                switchBox.style.left = "180px";
            }
        })
        $switchBoxLis.click(function() {
            $(this).siblings().removeAttr("on");
            $(this).attr("on", "on");
        });
        $run.click(function() {
            if ($(this).attr("type") != "paused") {
                $(this).attr("type", "paused");
                $(this).text("暂停");
                isPause = 1;
                if (pauseNode != "") {
                    Console("已启动脚本运行")
                    pauseNode();
                } else {
                    getCourseLists();
                }
            } else {
                $(this).removeAttr("type", "paused");
                $(this).text("运行");
                Console("已暂停脚本运行");
                isPause = 0;
            }
        })
        $leftBtn.click(function() {
            $contentLeft.attr("on") == "on" ? $contentLeft.removeAttr("on") : (() => {
                $contentLeft.attr("on", "on");
                if ($switchBtn.attr("show") != null) {
                    $switchBtn.click();
                }
            })()
        })
        $rightBtn.click(function() {
            $contentRight.attr("on") == "on" ? $contentRight.removeAttr("on") : $contentRight.attr("on", "on");
        });
        window.onresize = function() {
            if (window.matchMedia("(max-width:1148px)").matches) {
                if ($contentRight.attr("on") == "on") {
                    $rightBtn.click();
                }
            }
            if (window.matchMedia("(max-width:768px)").matches) {
                if ($switchBtn.attr("show") != null) {
                    $switchBtn.click();
                }
                if ($contentLeft.attr("on") == "on") {
                    $leftBtn.click()
                }
            }
        }
    });
})()
