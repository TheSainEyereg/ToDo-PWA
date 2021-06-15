const info = {
    build: '150621',
    version: 1
};
if (window.location.host == "localhost") document.title = "ToDo PWA Dev";

const debug_default = false;
const debug_time = true;
const theme_auto = true;
const el = document.querySelector.bind(document);
function ready(callback) {
    document.addEventListener("DOMContentLoaded", _=> {
        debug.log("DOM loaded", "#fff","#000");
        if (typeof callback != "undefined") callback();
        theme.initializate();
    });
};


const debug = {
    enabled: null,
    initializate() {
        this.enabled = localStorage.getItem("debug") === "true";
        if (localStorage.getItem("debug")) {
            this.set(this.enabled);
        } else {
            this.set(debug_default);
        }
    },
    set(arg) { //true or false
        this.enabled = arg;
        localStorage.setItem("debug", this.enabled);
        debug.log(`Set debug to ${this.enabled}`, "#00c800");
    },
    log(text, color, background) {
        if (this.enabled) {
            let out = "";
            if (debug_time) {
                let date = new Date;
                out += `[${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}]:`;
            }
            out += `%c ${text} `;
            console.log(out, `color: ${color}; background: ${background}`);
        }
    }
};

const theme = {
    current: null,
    auto: true,
    user: window.matchMedia("(prefers-color-scheme: dark)"),
    initializate() {
        this.auto = localStorage.getItem("theme_auto") === "true";
        if (localStorage.getItem("theme_auto")) {
            this.autoset(this.auto);
        } else {
            this.autoset(theme_auto);
        }
        const usercheck = _ => {
            if (theme.user.matches) {
                this.set("dark");
            } else {
                this.set("light");
            }
        }
        this.current = localStorage.getItem("theme");
        if ((this.current != "dark") && (this.current != "light")) {
            usercheck();
        } else {
            if (this.auto) usercheck(); else this.set(this.current);
        }
        this.user.onchange = _ => {if (this.auto) usercheck()};
    },
    autoset(arg) { //true or false
        this.auto = arg;
        localStorage.setItem("theme_auto", this.auto);
        debug.log("Set auto theme to " + this.auto, "#00c800");
    },
    set(arg) {
        document.body.classList.remove(this.current);
        this.current = arg;
        document.body.classList.add(this.current);
        document.querySelector(`meta[name="theme-color"]`).setAttribute("content",  getComputedStyle(document.body).getPropertyValue(`--${this.current}-first`));
        localStorage.setItem("theme", this.current);
        debug.log("Set theme to " + arg, "#00c800");
    },
    change() {
        switch (this.current) {
            case "light":
                this.set("dark");
                break;

            default:
                this.set("light");
                break;
        }
    }
};

const anim = {
    show(id, interval, timeout) {
        setTimeout(() => {
            const element = document.getElementById(id);
            let op = 0;
            debug.log(`Showing up ${id}`, "#226dc9");
            let timer = setInterval(() => {
                if (op >= 1){
                    clearInterval(timer);
                    debug.log(`Showing up for ${id} complete`, "#00c800");
                }
                element.style.opacity = op;
                op+=0.01;
            }, interval/100);
        }, timeout);
    },
    text: {
        anim(id, text, time) {
            const tick = time/text.length;
            const element = document.getElementById(id);
            const chars = "@#$%&/\\|;";
            let string ="";
            let i = 0;
            function render() {
                if (i < text.length) {
                    string+=text[i];
                    element.innerHTML = string+chars[Math.floor(Math.random()*chars.length)];
                    if (i==text.length-1) element.innerHTML = string;
                    i++;
                } else return
                setTimeout(render, tick);
            }
            render();
        }
    },
    title: {
        timer(ticks, time, timeout) {
            setTimeout(() => {
                const tick = time/ticks;
                let cur = ticks;
                debug.log(`Title counter started for ${tick} ticks every ${tick}ms`, "#226dc9");
                let timer = setInterval(() => {
                    if (cur <= 0) {
                        clearInterval(timer);
                        debug.log("Title counter complete", "#00c800");
                    }
                    document.title = cur;
                    cur--
                }, tick);
            },timeout);
        },
        anim(text, time, timeout) {
            setTimeout(() => {
                const tick = time/text.length;
                let cur = 0
                let title = ""
                debug.log(`Title animation started for "${text}" every ${tick}ms`, "#226dc9");
                let timer = setInterval (() => { //still hate "for (let v of text) {};"
                    if (cur >= text.length-1) {
                        clearInterval(timer);
                        debug.log("Title animation complete", "#00c800");
                    }
                    title = title + text[cur];
                    document.title = title;
                    cur++;
                }, tick);
            }, timeout);
        }
    }
};

const list = {
    data: [],
    initializate() {
        if (!localStorage.getItem('list')) return localStorage.setItem('list', JSON.stringify(this.data));
        this.data = JSON.parse(localStorage.getItem('list'));
        debug.log(`Task init`);
        this.update();
    },
    update() {
        localStorage.setItem('list', JSON.stringify(this.data));
        el('#todoList').innerHTML = "";
        debug.log(`Started updating for ${this.data.length} tasks`);
        debug.log(`-----------------------`);
        for (let i in this.data) {
            const task = document.createElement("li");
            task.innerHTML = `${this.data[i].task}<span tid="${i}" id="delete">×</span>`;
            if (this.data[i].complete == true) task.classList.add('complete');
            debug.log(`Added "${task.innerText}" task, complete: ${this.data[i].complete}, tid: ${i}`);
            el('#todoList').prepend(task);
            task.onclick = e => {this.complete(e.target)}
            task.children[0].onclick = e => {this.delete(e.target)}
        };
        debug.log(`-----------------------`);
    },
    add() {
        if (!el('#add_dial #textField')) return debug.log("No add dialog!", "red")
        const task = el('#add_dial #textField').value;
        el('#add_dial #textField').value = "";
        popup.close('add');
        if (!task) return //alert('Введите имя задачи.')
        this.data.push({"task": task, "complete": false});
        debug.log(`Added "${task}" task`);
        this.update();
    },
    delete(el) {
        const tid = el.getAttribute('tid');
        this.data.splice(tid,1);
        debug.log(`Deleted id${tid} task`);
        this.update();
    },
    complete(el) {
        if(!el.children[0]) return
        const tid = parseInt(el.children[0].getAttribute('tid'));
        if (!el.classList.contains('complete')) {
            el.classList.add('complete');
            this.data[tid].complete = true;
            debug.log(`Complete id${tid} task`);
        } else {
            el.classList.remove('complete');
            this.data[tid].complete = false;
            debug.log(`Uncomplete id${tid} task`);
        };
        this.update();
    }
};

const popup = {
    show(id, content)  {
        const divId = `${id}_dial`;
        if (content) {
            if (el(`#${divId}`)) return debug.log(`Popup with id="${id}" already exists!`, 'red');
            const popup = document.createElement("div");
            popup.classList.add("popup");
            popup.id = divId;
            const box = document.createElement("div");
            box.classList.add("box")
            box.innerHTML = content;
    
            popup.append(box);
            document.body.append(popup);
            anim.show(divId, 1, 0);
    
            //click outside detection
            el('.popup .box').onclick = _ => {
                el('.popup .box').dataset.clicked = 1;
            };
            el('.popup').onclick = _ => {
                const clicked = (el('.popup .box').dataset.clicked == 1);
                debug.log(clicked);
                el('.popup .box').dataset.clicked = 0;
                if (!clicked) this.close(id);
            };
        } else return debug.log(`No content given`, 'red');
    },
    close(id) {
        divId = `${id}_dial`;
        if(el(`#${divId}`)) el(`#${divId}`).remove();
        else return debug.log(`No popup window with id="${id}"`, 'red');

    }
};

const menus = {
    add() {
        const html = `
        <h3>Add task</h3>
        <div class="wrapper">
            <input type="text" id="textField" placeholder="Task name" autofocus>
            <a onclick="list.add()">✔</a>
        </div>
        `;
        popup.show('add', html);
        el('#add_dial #textField').focus();
    },
    settings() {
        const html = `
        <h3>Settings</h3>
        <div class="wrapper">
            <table>
                <tr id="s_autotheme">
                    <td>Auto theme</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox">
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>
                <tr id="s_theme">
                    <td>Theme</td>
                    <td>
                        <a onclick="theme.change()">
                            <div>⬤</div>
                            <div>⬤</div>
                            <div>⬤</div>
                            <div>⬤</div>
                        </a>
                    </td>
                </tr>
                <tr id="s_data">
                    <td>
                        Save data
                    </td>
                    <td>
                        <a id="export">Export</a>
                        <a id="import">Import</a>
                    </td>
                </tr>
                <tr id="s_clearall">
                    <td style="text-align:center;" colspan="2">
                        <a>Clear all tasks</a>
                    </td>
                </tr>
            </table>
        </div>
        `;
        popup.show('settings', html);

        let sw = el('#s_autotheme input');
        sw.checked = theme.auto;
        sw.onclick =_ => {
            theme.autoset(sw.checked);
        };

        let exb = el('#settings_dial #s_data a#export');
        exb.onclick = _ => {
            const form = document.createElement("input");
            form.setAttribute("type", "text");
            form.id = "copyPlace";
            document.body.append(form);
            form.value = JSON.stringify(list.data);
            form.select();
            document.execCommand("copy");
            form.remove();
            exb.classList.add('complete');
            exb.innerText = 'Copied!';
            debug.log('Exported data to clipboard!', '#00c800')
            alert('Copied data to clipbord!\nMake sure you saved it to safe place!')
            setTimeout(_ => {
                exb.classList.remove('complete');
                exb.innerText = 'Export';
            }, 1500)
        };
        let inb = el('#settings_dial #s_data a#import');
        inb.onclick = _ => {
            let input = prompt('Enter exported value');
            if (input == null || input.length == 0) return debug.log('Nothing was entered', 'red')
            try {
                let data = JSON.parse(input);
                list.data = data;
                list.update();
                inb.classList.add('complete');
                inb.innerText = 'Restored!';
                debug.log('Imported data successfully!', '#00c800');
                console.log(data);
            } catch (e) {
                alert(`Error occured:\n${e}`);
                inb.classList.add('failed');
                inb.innerText = 'Error!';
                debug.log('Error at data import!', 'red');
                console.error(e);
            }
            setTimeout(_ => {
                inb.classList.remove('failed');
                inb.classList.remove('complete');
                inb.innerText = 'Import';
            }, 1500);
        };

        let rall = el('#settings_dial #s_clearall a');
        rall.onclick = _ => {
            if (!rall.classList.contains('crit')) {
                rall.classList.add('crit');
                rall.innerText = 'Are you sure?';
            } else {
                list.data = [];
                list.update();
                rall.innerText = 'Cleared!';
                setTimeout(_ => {
                    rall.classList.remove('crit');
                    rall.innerText = 'Clear all tasks';
                }, 1500);
            };
        };
    },

};

debug.initializate();
debug.log('Build '+info.build+'v'+info.version, '#fff','#000');
ready(_ => {
    debug.log('DOM loaded', '#fff','#000');

    list.initializate();
    theme.initializate();

    document.onkeypress = e => {
        if(e.keyCode==13) {
            debug.log('Pressed enter');
            list.add();
        };
    };

    window.onresize = _ => {
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width < 500) window.resizeTo(500, height);
        if (height < 750) window.resizeTo(width, 750);
    }
});