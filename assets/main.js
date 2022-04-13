const info = {
    build: "130721",
    version: 2
};
if (window.location.host.includes("localhost")) document.title = "ToDo PWA Dev";

const debug_default = false;
const debug_time = true;
const theme_auto = true;

const el = document.querySelector.bind(document);
function ready(callback) {
    document.addEventListener("DOMContentLoaded", _=> {
        debug.log("DOM loaded", "#fff","#000");
        if (typeof callback != "undefined") callback();
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

const animationManager = {
	newScroll: localStorage.getItem("newScroll") === "true",
	newScrollSet(arg) {
		this.newScroll = arg;
		if (document.body.classList.contains("newScroll") && !this.newScroll) {
			document.body.classList.remove("newScroll");
		} else if (!document.body.classList.contains("newScroll") && this.newScroll) {
			document.body.classList.add("newScroll");
		}
		localStorage.setItem("newScroll", this.newScroll);
		debug.log("Set newScroll to " + this.newScroll, "#00c800");
	}
}

const task = {
    data: {
        version: 2,
        oldstyle: false,
        list: []
    },
    migrate: {
        check() {
            debug.log("Checking for data migrate...")
            let old;
            if (!!localStorage.getItem("list")) {
                old = JSON.parse(localStorage.getItem("list"));
                this.V1toV2(old);
                localStorage.removeItem("list");
            } else if (typeof task.data.version === "undefined"){
                old = task.data;
                this.V1toV2(old);
            } else if (task.data.version == 2) {

            } else {
                debug.log("Data format is up to date!");
            }

        },
        V1toV2(old) {
            debug.log("Started data migration from V1 to V2...");
            localStorage.removeItem("list");
            task.data = {version: 2, list: []};
            for (let i in old) {
                const push = {};
                push.task = old[i].task;
                push.date = new Date();
                push.completed = old[i].complete;
                push.important = false;
                push.repeat = false;
                task.data.list.push(push);
            }
            task.data.oldstyle = true; 
            debug.log("Migration completed!", "green");
        },
        V2toV3() {}
    },
    initializate() {
        if (!localStorage.getItem("todo-data")) localStorage.setItem("todo-data", JSON.stringify(this.data));
        this.data = JSON.parse(localStorage.getItem("todo-data"));
        debug.log("Task initialization");
        this.update();
    },
    update() {
        this.migrate.check();
        localStorage.setItem("todo-data", JSON.stringify(this.data));
        el("#todoList").innerHTML = "";
        debug.log(`Started updating for ${this.data.list.length} tasks`);
        debug.log("-----------------------");
        for (let i = this.data.list.length-1; i >= 0; i--) {
            const task = document.createElement("div");
			task.classList.add("item");
            task.dataset.tid = i;
            if (!this.data.oldstyle) {
                el("#todoList").classList.remove("oldstyle")
                task.innerHTML = `
                <span class="complete">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 1080 1080" "xml:space="preserve">
                        <style type="text/css">
                        .ch0{stroke-width:50;stroke-linejoin:round;stroke-miterlimit:10;}
                        </style>
                        <polygon class="ch0" points="420.2,850.01 375.73,807.9 375.13,807.29 106.93,539.1 195.82,450.22 420.87,675.27 886.56,229 
                        973.53,319.76 "/>
                    </svg>
                </span>
                <span class="task"></span>
                <span class="star">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 1080 1080" xml:space="preserve">
                        <style type="text/css">
                            .im0{stroke-width:40;stroke-linejoin:round;stroke-miterlimit:10;}
                            .im1{stroke:#000000;stroke-width:40;stroke-linejoin:round;stroke-miterlimit:10;}
                        </style>
                        <g>
                            <polygon class="im0" points="540.1,92 685.7,387 1011.2,434.3 775.6,663.9 831.2,988.1 540.1,835 248.9,988.1 304.5,663.9 
                                69,434.3 394.5,387 	"/>
                            <path class="im1" d="M540.1,94.5l144.6,293l0.3,0.5l0.6,0.1l323.3,47l-234,228l-0.4,0.4l0.1,0.6l55.2,322L540.6,834l-0.5-0.3
                                l-0.5,0.3l-289.2,152l55.2-322l0.1-0.6l-0.4-0.4l-234-228l323.3-47l0.6-0.1l0.3-0.5L540.1,94.5 M540.1,92L394.5,387L69,434.3
                                l235.5,229.6l-55.6,324.2L540.1,835l291.1,153.1l-55.6-324.2l235.5-229.6L685.7,387L540.1,92L540.1,92z"/>
                        </g>
                    </svg>
                <span>
                `;
				task.children[1].innerText = this.data.list[i].task;

                task.children[0].onclick = _ => {this.complete(task.dataset.tid)};
                task.children[1].onclick = _ => {menus.manage(task.dataset.tid)};
                task.children[2].onclick = _ => {this.important(task.dataset.tid)};
            } else {
                el("#todoList").classList.add("oldstyle")
                task.innerHTML = `
                <span class="task"></span>
                <span class="manage">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <g>
                            <circle cx="254.69" cy="255.51" r="39.75"/>
                            <circle cx="255.69" cy="139.51" r="39.75"/>
                            <circle cx="255.69" cy="371.51" r="39.75"/>
                        </g>
                    </svg>
                <span>
                `;
				task.children[0].innerText = this.data.list[i].task;

                task.children[0].onclick = _ => {this.complete(task.dataset.tid)};
                task.children[1].onclick = _ => {menus.manage(task.dataset.tid)};
                //task.children[2].onclick = _ => {this.important(task.dataset.tid)};
            };

            if (this.data.list[i].completed == true) task.classList.add("completed");
            if (this.data.list[i].important) {
                task.classList.add("important")
                el("#todoList").prepend(task);
            } else {
                el("#todoList").append(task);
            }
            debug.log(`Added "${this.data.list[i].task}" task, complete: ${this.data.list[i].completed}, important: ${this.data.list[i].important}, tid: ${i}`);
        };
        debug.log("-----------------------");
    },
    add(task) {
        if (!task) return;
        this.data.list.push({"task": task, "date": new Date(),"complete": false, "important": false, "repeat": false});
        debug.log(`Added "${task}" task`);
        this.update();
    },
    delete(tid) {
        this.data.list.splice(tid,1);
        debug.log(`Deleted id${tid} task`);
        this.update();
    },
    complete(tid) {
        if (!this.data.list[tid].completed) {
            this.data.list[tid].completed = true;
            debug.log(`Complete id${tid} task`);
        } else {
            this.data.list[tid].completed = false;
            debug.log(`Uncomplete id${tid} task`);
        };
        this.update();
    },
    important(tid) {
        if (!this.data.list[tid].important) {
            this.data.list[tid].important = true;
            debug.log(`Set important id${tid} task`);
        } else {
            this.data.list[tid].important = false;
            debug.log(`Unset important id${tid} task`);
        };
        this.update();
    }
};

const gui = {
    modal: {
        show(id, html)  {
            const divId = `${id}_dial`;
            if (html) {
                if (el(`#${divId}`)) return debug.log(`Popup with id="${id}" already exists!`, "red");
                const modal = document.createElement("div");
                modal.classList.add("modal");
                modal.id = divId;
                const box = document.createElement("div");
                box.classList.add("box")
                box.innerHTML = html;
        
                modal.append(box);
                document.body.append(modal);
        
                //click outside detection
                box.onclick = _ => {
                    box.dataset.clicked = 1;
                };
                modal.onclick = e => {
                    const clicked = (box.dataset.clicked == 1);
                    debug.log(clicked);
                    box.dataset.clicked = 0;
                    if (!clicked) this.close(id);
                };
            } else return debug.log(`No HTML content given`, "red");
        },
        close(id) {
            const divId = `${id}_dial`;
            if(el(`#${divId}`)) el(`#${divId}`).remove();
            else return debug.log(`No modal window with id="${id}"`, "red");
    
        }
    }
};

const menus = {
    add() {
        const html = `
        <h3>Add task</h3>
        <div class="wrapper">
            <input type="text" id="textField" placeholder="Task name">
            <a>✔</a>
        </div>
        `;
        gui.modal.show("add", html);
        el("#add_dial input").focus();

        el("#add_dial a").onclick = _=>{
            const value = el("#add_dial input").value;
            el("#add_dial input").value = "";
            task.add(value)
            gui.modal.close("add");
        };
    },
    manage(tid) {
        html = `
        <h3 contenteditable="true">Manage task</h3>
        <div class="wrapper">
            <div class="info">
                <span id="time"></span>
            </div>
            <div class="flexbox">
                <a class="star">   
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 1080 1080" xml:space="preserve">
                        <style type="text/css">
                            .im0{stroke-width:40;stroke-linejoin:round;stroke-miterlimit:10;}
                            .im1{stroke:#000000;stroke-width:40;stroke-linejoin:round;stroke-miterlimit:10;}
                        </style>
                        <g>
                            <polygon class="im0" points="540.1,92 685.7,387 1011.2,434.3 775.6,663.9 831.2,988.1 540.1,835 248.9,988.1 304.5,663.9 
                                69,434.3 394.5,387 	"/>
                            <path class="im1" d="M540.1,94.5l144.6,293l0.3,0.5l0.6,0.1l323.3,47l-234,228l-0.4,0.4l0.1,0.6l55.2,322L540.6,834l-0.5-0.3
                                l-0.5,0.3l-289.2,152l55.2-322l0.1-0.6l-0.4-0.4l-234-228l323.3-47l0.6-0.1l0.3-0.5L540.1,94.5 M540.1,92L394.5,387L69,434.3
                                l235.5,229.6l-55.6,324.2L540.1,835l291.1,153.1l-55.6-324.2l235.5-229.6L685.7,387L540.1,92L540.1,92z"/>
                        </g>
                    </svg>
                </a>
                <a class="complete">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 1080 1080" "xml:space="preserve">
                        <style type="text/css">
                        .ch0{stroke-width:50;stroke-linejoin:round;stroke-miterlimit:10;}
                        </style>
                        <polygon class="ch0" points="420.2,850.01 375.73,807.9 375.13,807.29 106.93,539.1 195.82,450.22 420.87,675.27 886.56,229 
                        973.53,319.76 "/>
                    </svg>
                </a>
                <a class="delete">Delete</a>
            </div>
        </div>
        `
        gui.modal.show("manage", html);

        const data = task.data.list[tid];
        el("#manage_dial h3").innerText = data.task;
        const date = new Date(data.date);
        el("#manage_dial #time").innerText = `Created at: \n${date.toString().split(" GMT")[0]}`;
        
        const edit = el("#manage_dial h3");
        const important = el("#manage_dial .star");
        const complete = el("#manage_dial .complete");
        const remove = el("#manage_dial .delete");
        function render() {
            if (data.important) {important.classList.add("checked")}
            else {important.classList.remove("checked")};
            if (data.completed) {complete.classList.add("checked")}
            else {complete.classList.remove("checked")};
        };
        render();
        
        let old = data.task;
        edit.onfocus = _ => {edit.innerText = data.task;};
        edit.oninput = _ => {if (edit.innerText != "") data.task = edit.innerText; else data.task = old;};
        edit.onblur = _ => {old = data.task; edit.innerText = data.task; edit.scrollLeft = 0; task.update()};

        important.onclick = _ => {task.important(tid);render()};
        complete.onclick = _ => {task.complete(tid);render()};
        remove.onclick = _ => {task.delete(tid); gui.modal.close("manage")};

    },
    settings() {
        const html = `
        <h3>Settings</h3>
        <div class="wrapper">
            <table>
				<tr id="s_header">
					<td style="text-align:center;" colspan="2">
						Style
					</td>
				</tr>
				<tr id="s_style">
					<td>
						Old style
					</td>
					<td>
						<label class="switch">
							<input type="checkbox">
							<span class="slider"></span>
						</label>
					</td>
				</tr>
				<tr id="s_scroll">
					<td>
						New scrolling
					</td>
					<td>
						<label class="switch">
							<input type="checkbox">
							<span class="slider"></span>
						</label>
					</td>
				</tr>
				<tr id="s_header">
					<td style="text-align:center;" colspan="2">
						Theme
					</td>
				</tr>
                <tr id="s_autotheme">
                    <td>Auto detect</td>
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
				<tr id="s_header">
					<td style="text-align:center;" colspan="2">
						Data management
					</td>
				</tr>
                <tr id="s_data">
                    <td>
                        Local storage
                    </td>
                    <td>
                        <a id="export">Export</a>
                        <a id="import">Import</a>
                        <a id="delete" class="crit">Delete</a>
                    </td>
                </tr>
                <tr id="s_about">
                    <td style="text-align:center;" colspan="2">
						<a href="https://github.com/TheSainEyereg/ToDo-PWA">Project GitHub</a><br>
						&copy;${new Date().getFullYear()} <a href="https://olejka.ru/">Oleg Logvinov</a>
                    </td>
                </tr>
            </table>
        </div>
        `;
        gui.modal.show("settings", html);

        const ssw = el("#s_style input");
        ssw.checked = task.data.oldstyle;
        ssw.onclick = _ => {
            task.data.oldstyle = ssw.checked;
            task.update();
        };
        const smsw = el("#s_scroll input");
        smsw.checked = animationManager.newScroll;
        smsw.onclick = _ => {
            animationManager.newScrollSet(smsw.checked);
        };

        const asw = el("#s_autotheme input");
        asw.checked = theme.auto;
        asw.onclick = _ => {
            theme.autoset(asw.checked);
        };

        const exb = el("#settings_dial #s_data a#export");
        const inb = el("#settings_dial #s_data a#import");
        const del = el("#settings_dial #s_data a#delete");

        exb.onclick = _ => {
            const form = document.createElement("input");
            form.setAttribute("type", "text");
            form.id = "copyPlace";
            document.body.append(form);
            form.value = JSON.stringify(task.data);
            form.select();
            document.execCommand("copy");
            form.remove();
            exb.classList.add("completed");
            exb.innerText = "Copied!";
            debug.log("Exported data to clipboard!", "#00c800")
            alert("Copied data to clipbord!\nMake sure you saved it to safe place!")
            setTimeout(_ => {
                exb.classList.remove("completed");
                exb.innerText = "Export";
            }, 1500)
        };
        inb.onclick = _ => {
            const input = prompt("Enter exported value");
            if (input == null || input.length == 0) return debug.log("Nothing was entered", "red")
            try {
                let data = JSON.parse(input);
                task.data = data;
                task.update();
                inb.classList.add("completed");
                inb.innerText = "Restored!";
                debug.log("Imported data successfully!", "#00c800");
                console.log(data);
            } catch (e) {
                alert(`Error occured:\n${e}`);
                inb.classList.add("failed");
                inb.innerText = "Error!";
                debug.log("Error at data import!", "red");
                console.error(e);
            }
            setTimeout(_ => {
                inb.classList.remove("failed");
                inb.classList.remove("completed");
                inb.innerText = "Import";
            }, 1500);
        };
        del.onclick = _ => {
			if (confirm("Are you sure?")) {
				task.data.list = [];
				task.update();
				del.classList.add("failed");
				del.innerText = "Deleted!";
				debug.log("Data cleared!", "#00c800");
			}
			setTimeout(_ => {
				del.classList.remove("failed");
				del.innerText = "Delete";
			}, 1500);
        };
    }
};

debug.initializate();
debug.log(`Build ${info.build}v${info.version}`, "#fff","#000");
ready(_ => {
    task.initializate();
    theme.initializate();

	animationManager.newScrollSet(animationManager.newScroll);

    document.onkeypress = e => {
        if(e.key == "Enter") {
            debug.log("Pressed enter");
            if (el("#add_dial")) el("#add_dial a").click();
            if (el("#manage_dial")) el("#manage_dial h3").blur();
        };
    };

    window.onresize = _ => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width < 500) window.resizeTo(500, height);
        if (height < 750) window.resizeTo(width, 750);
    }
});