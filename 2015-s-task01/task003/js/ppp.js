var localStorage = window.localStorage,
    taskList = window.localStorage.taskList || [{
        '默认分类': [{
            'planA': [{
                "title": "plan-A-01",
                "date": "2016-07-07",
                "content": "plan-A-01plan-A-01",
                "state": 1
            }]
        }]
    }, {
        '宝贝计划': [{
            'planA': [{
                "title": "plan-A-01",
                "date": "2016-07-07",
                "content": "plan-A-01plan-A-01",
                "state": 1
            }, {
                "title": "plan-A-02",
                "date": "2016-08-08",
                "content": "plan-A-02plan-A-02",
                "state": 0
            }, {
                "title": "plan-A-03",
                "date": "2016-09-09",
                "content": "plan-A-03plan-A-03",
                "state": 0
            }]
        }, {
            'planB': [{
                "title": "plan-B-01",
                "date": "2016-10-16",
                "content": "plan-B-01plan-B-01",
                "state": 0
            }]
        }]
    }];
var sumData = [];
var currentTask = {};
var currentTaskDetail = {};

function jsonToData(data) {
    taskTypeChange(data, null, sumData);
    for (var i = 0, l = sumData.length; i < l; i += 1) {
        var title = sumData[i].title,
            childData = data[i][title];
        if (childData && childData.length > 0) {
            taskTypeChange(childData, sumData[i], sumData[i].children);
        }
    }
    for (var i = 0, l = sumData.length; i < l; i += 1) {
        var temp = sumData[i].children;
        var title = sumData[i].title,
            childData = data[i][title];
        if (temp && temp.length > 0) {
            for (var j = 0, ll = temp.length; j < ll; j += 1) {
                var taskTitle = temp[j].title,
                    taskData = childData[j][taskTitle];
                taskChange(taskData, temp[j], temp[j].children);
            }
        }
    }
}

function taskTypeChange(data, parent, result) {
    for (var i = 0, l = data.length; i < l; i += 1) {
        var temp = data[i];
        for (var k in temp) {
            if (temp.hasOwnProperty(k)) {
                var taskType = new TaskType(k, parent);
                result.push(taskType);
            }
        }
    }
}

function taskChange(data, parent, result) {
    for (var i = 0, l = data.length; i < l; i += 1) {
        var temp = data[i],
            title = temp.title,
            date = new Date(temp.date),
            content = temp.content,
            state = temp.state,
            task = new Task(title, date, content, state, parent);
        result.push(task);
    }
}

jsonToData(taskList);

function renderFloder(data) {
    var str = '',
        node = document.querySelector('.floder-list'),
        allNode = document.querySelector('.task-num'),
        taskCount = 0;
    for (var i = 0, l = data.length; i < l; i += 1) {
        var temp = data[i],
            sum = 0;
        if (temp.children && temp.children.length > 0) {
            var list = '<ul class="file-list">';
            for (var j = 0, ll = temp.children.length; j < ll; j += 1) {
                var child = temp.children[j];
                sum += child.children.length;
                list += '<li data-title="' + child.title + '" data-parent="' + child.parent.title + '"><i class="icon icon-file"></i>' + child.title + '（' + child.children.length + '）</li>';
            }
            list += '</ul>';
            str += '<li data-title="' + temp.title + '"><i class="icon icon-floder"></i>' + temp.title + '（' + sum + '）<i class="icon icon-delete"></i>' + list + '</li>'
        } else {
            str += '<li data-title="' + temp.title + '"><i class="icon icon-floder"></i>' + temp.title + '（0）<i class="icon icon-delete"></i></li>';
        }
        taskCount += sum;
    }
    node.innerHTML = str;
    allNode.innerText = taskCount;
}

renderFloder(sumData);

function getTasks(data, title, parent) {
    if (parent) {
        for (var i = 0, l = data.length; i < l; i += 1) {
            if (data[i].title === parent) {
                var temp = data[i].children;
                for (var j = 0, ll = temp.length; j < ll; j += 1) {
                    if (temp[j].title === title) {
                        return temp[j].children;
                    }
                }
            }
        }
    } else {
        for (var i = 0, l = data.length; i < l; i += 1) {
            if (data[i].title === title) {
                var result = [],
                    temp = data[i].children;
                for (var j = 0, ll = temp.length; j < ll; j += 1) {
                    result = result.concat(temp[j].children);
                }
            }
        }
        return result;
    }
}

function dateTask(data) {
    var result = {};
    for (var i = 0, l = data.length; i < l; i += 1) {
        var date = data[i].fromDate();
        if (!result[date]) {
            result[date] = [];
        }
        result[date].push(data[i]);
    }
    return result;
}

function getTasksByState(data, state) {
    var result = {};
    for (var k in data) {
        var temp = data[k];
        for (var i = 0, l = temp.length; i < l; i += 1) {
            if (temp[i].state === state) {
                if (!result[k]) {
                    result[k] = [];
                }
                result[k].push(temp[i]);
            }
        }
    }
    return result;
}

function renderTask(data) {
    var str = '',
        node = document.querySelector('.task dl');
    for (var k in data) {
        var temp = data[k];
        str += '<dt>' + k + '</dt>';
        for (var i = 0, l = temp.length; i < l; i += 1) {
            str += '<dd data-date="' + k + '">' + temp[i].title + '</dd>';
        }
    }
    node.innerHTML = str;
}

function getTaskDetail(data, date, title) {
    var tasks = data[date];
    for (var i = 0, l = tasks.length; i < l; i += 1) {
        if (tasks[i].title === title) {
            return tasks[i];
        }
    }
}

function renderTaskDetail(task) {
    var box = document.querySelector('.task-detail'),
        title = box.querySelector('input[name="title"]'),
        date = box.querySelector('input[name="date"]'),
        content = box.querySelector('textarea[name="content"]');
    title.value = task.title;
    date.value = task.fromDate();
    content.value = task.content;
}

function changeTaskDetail(data, task) {
    var father = task.parent,
        grandFather = father.parent;
    for (var i = 0, l = data.length; i < l; i += 1) {
        if (data[i] === grandFather) {
            var temp = data[i].children;
            for (var j = 0, ll = temp.length; j < ll; j += 1) {
                if (temp[i] === father) {
                    var child = temp[i].children;
                    for (var k = 0, lll = child.length; k < lll; k += 1) {
                        if (child[k].title === task.title) {
                            child[k].change(task);
                        }
                    }
                }
            }
        }
    }
}

function bindEvent() {
    var floder = document.querySelector('.floder-list');
    addEvent(floder, 'click', function(e) {
        var event = e || window.event,
            target = event.target || event.srcElement;
        if (target.nodeName.toUpperCase() === 'LI') {
            var title = target.getAttribute('data-title'),
                parent = target.getAttribute('data-parent'),
                task = getTasks(sumData, title, parent);
            currentTask = dateTask(task);
            renderTask(currentTask);
            removeClassBat(floder, 'li', 'selected');
            addClass(target, 'selected');
            var node = document.querySelector('dl dd');
            if (node) {
                node.click();
            }
        }
    });

    var state = document.querySelector('.task-state');
    addEvent(state, 'click', function(e) {
        var event = e || window.event,
            target = event.target || event.srcElement;
        if (target.nodeName.toUpperCase() === 'SPAN') {
            var stateNum = target.getAttribute('data-state'),
                task = stateNum === 'all' ? currentTask : getTasksByState(currentTask, Number(stateNum));
            renderTask(task);
            removeClassBat(state, 'span', 'selected');
            addClass(target, 'selected');
            var node = document.querySelector('dl dd');
            if (node) {
                node.click();
            }
        }
    });

    var dl = document.querySelector('dl');
    addEvent(dl, 'click', function(e) {
        var event = e || window.event,
            target = event.target || event.srcElement;
        if (target.nodeName.toUpperCase() === 'DD') {
            var date = target.getAttribute('data-date'),
                title = target.innerText,
                currentTaskDetail = getTaskDetail(currentTask, date, title);
            renderTaskDetail(currentTaskDetail);
            removeClassBat(dl, 'dd', 'selected');
            addClass(target, 'selected');
        }
    });

    var edit = document.querySelector('.icon-edit');
    addEvent(edit, 'click', function(e) {
        var event = e || window.event,
            target = event.target || event.srcElement;
        var box = document.querySelector('.task-detail'),
            date = box.querySelector('input[name="date"]'),
            content = box.querySelector('textarea[name="content"]');
        date.removeAttribute('disabled');
        content.removeAttribute('disabled');
        removeClass(date, 'disableEdit');
        removeClass(content, 'disableEdit');
        addClass(document.querySelector('.edit-done'), 'hide');
        removeClass(document.querySelector('.save-cancel'), 'hide');
        date.focus();
    });

    var cancel = document.querySelector('.save-cancel .cancel');
    addEvent(cancel, 'click', function(e) {
        var event = e || window.event,
            target = event.target || event.srcElement;
        var box = document.querySelector('.task-detail'),
            date = box.querySelector('input[name="date"]'),
            content = box.querySelector('textarea[name="content"]');
        date.value = currentTaskDetail.date;
        content.value = currentTaskDetail.content;
        date.setAttribute('disabled', true);
        content.setAttribute('disabled', true);
        addClass(date, 'disableEdit');
        addClass(content, 'disableEdit');
        removeClass(document.querySelector('.edit-done'), 'hide');
        addClass(document.querySelector('.save-cancel'), 'hide');
    });
}

function init() {
    bindEvent();
    document.querySelector('.floder-list li').click();
}
init();