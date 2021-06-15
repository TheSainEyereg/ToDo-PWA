const info = {
    build: '110521',
    version: 4
}

debug_default = false;
debug_time = true;
theme_auto = true;

let d = document;
let w = window;

if (w.location.host == "localhost") d.title = "ToDo PWA Dev";

const debug = {
    enabled: null,
    init() {
        this.enabled = localStorage.getItem('debug') === 'true';
        if (localStorage.getItem('debug')) {
            this.set(this.enabled);
        } else {
            this.set(debug_default);
        }
    },
    set(arg) { //true or false
        this.enabled = arg;
        localStorage.setItem('debug', this.enabled);
        debug.log('Set debug to ' + this.enabled, '#00c800');
    },
    log(text, color, background) {
        if (this.enabled) {
            let out = '';
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
    user: w.matchMedia('(prefers-color-scheme: dark)'),
    init() {
        this.auto = localStorage.getItem('todo-theme_auto') === 'true';
        if (localStorage.getItem('todo-theme_auto')) {
            this.autoset(this.auto);
        } else {
            this.autoset(theme_auto);
        }
        const usercheck = _ => {
            if (theme.user.matches) {
                this.set('dark');
            } else {
                this.set('light');
            }
        }
        this.current = localStorage.getItem('todo-theme');
        if ((this.current != 'dark') && (this.current != 'light')) {
            usercheck();
        } else {
            if (this.auto) usercheck(); else this.set(this.current);
        }
        this.user.onchange = _ => {if (this.auto) usercheck()};
    },
    autoset(arg) { //true or false
        this.auto = arg;
        localStorage.setItem('todo-theme_auto', this.auto);
        debug.log('Set auto theme to ' + this.auto, '#00c800');
    },
    set(arg) {
        this.current = arg;
        $('body').removeClass();
        $('body').addClass(this.current);
        localStorage.setItem('todo-theme', this.current);
        debug.log('Set theme to ' + this.current, '#00c800');
        $("meta[name='theme-color']").attr('content', $(':root').css(`--${this.current}-first`));
    },
    change() {
        if (this.current == 'light') {
            this.set('dark');
        } else {
            this.set('light');
        }
    }
};

const anim = {
    show(element, interval, timeout) {
        setTimeout(() => {
            let op = 0;
            debug.log('Showing up '+element[0].id, '#226dc9'); //Мусор с моего вебсайта (Хотя я бы дебаг интегрировал)
            let timer = setInterval(() => {
                if (op >= 1){
                    clearInterval(timer);
                    debug.log('Showing up for '+element[0].id+' complete', '#00c800');
                }
                element.css('opacity', op);
                op+=0.01;
            }, interval/100);
        }, timeout);
    },
    title: {
        timer(ticks, time, timeout) {
            setTimeout(() => {
                let tick = time/ticks;
                let cur = ticks;
                debug.log('Title counter started for '+ticks+' ticks every '+tick+'ms', '#226dc9');
                let timer = setInterval(() => {
                    if (cur <= 0) {
                        clearInterval(timer);
                        debug.log('Title counter complete', '#00c800');
                    }
                    d.title = cur;
                    cur--;
                }, tick)
            },timeout)
        },
        anim(text, time, timeout) {
            setTimeout(() => {
                let tick = time/text.length;
                let cur = 0;
                let title = '';
                debug.log('Title animation started for \''+text+'\' every '+tick+'ms', '#226dc9');
                let timer = setInterval (() => { //still hate 'for (let v of text) {};'
                    if (cur >= text.length-1) {
                        clearInterval(timer);
                        debug.log('Title animation complete', '#00c800');
                    }
                    title = title + text[cur];
                    d.title = title;
                    cur++;
                }, tick);
            }, timeout);
        }
    }
};

const list = {
    data: [],
    init() {
        if (!localStorage.getItem('list')) return localStorage.setItem('list', JSON.stringify(this.data));
        this.data = JSON.parse(localStorage.getItem('list'));
        debug.log(`Task init`);
        this.update();
    },
    update() {
        localStorage.setItem('list', JSON.stringify(this.data));
        $('#todoList').children().remove();
        debug.log(`Started updating for ${this.data.length} tasks`);
        debug.log(`-----------------------`);
        for (let i in this.data) {
            let task = $('<li></li>');
            task.html(`${this.data[i].task}<span tid="${i}" id="delete">×</span>`);
            if (this.data[i].complete == true) task.addClass('complete');
            debug.log(`Added "${task.text()}" task, complete: ${this.data[i].complete}, tid: ${i}`);
            $('#todoList').prepend(task);
        };
        debug.log(`-----------------------`);
        $('#todoList').children().on('click', a => {
            this.complete($(a.target));
        });
        $('#todoList').children().children().on('click', a => {
            this.delete($(a.target));
        });
        debug.log(`Added events`);
    },
    add() {
        let task = $('#add_dial #textField').val();
        $('#add_dial #textField').val('');
        popup.close('add');
        if (!task) return //alert('Введите имя задачи.')
        this.data.push({"task": task, "complete": false});
        debug.log(`Added "${task}" task`);
        this.update();
    },
    delete(el) {
        let tid = el.attr('tid');
        this.data.splice(tid,1);
        debug.log(`Deleted id${tid} task`);
        this.update();
    },
    complete(el) {
        let tid = parseInt($(el.children()).attr('tid'));
        if (!el.hasClass('complete')) {
            el.addClass('complete');
            this.data[tid].complete = true;
            debug.log(`Complete id${tid} task`);
        } else {
            el.removeClass('complete');
            this.data[tid].complete = false;
            debug.log(`Uncomplete id${tid} task`);
        };
        this.update();
    }
};

const popup ={
    show(id, content)  {
        divId = `${id}_dial`;
        if (content) {
            if ($(`#${divId}`)[0]) return debug.log(`Popup with id="${id}" already exists!`, 'red');
            let popup = $(`<div id="${divId}" class="popup"></div>`);
            let box = $('<div class="box"></div>');
            box.html(content);
    
            popup.append(box);
            $('body').append(popup);
            anim.show($(`#${divId}`), 1, 0);
    
            //click outside detection
            $('.popup .box').on('click', _ => {
                $('.popup .box').data('clicked', '1');
            });
            $('.popup').on('click', _ => {
                let clicked = ($('.popup .box').data('clicked') == '1');
                debug.log(clicked);
                if (!clicked) this.close(id);
                $('.popup .box').data('clicked', '0');
            });
        } else return debug.log(`No content given`, 'red');
    },
    close(id) {
        divId = `${id}_dial`;
        if($(`#${divId}`)[0]) $(`#${divId}`).remove();
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
        $('#add_dial #textField').focus();
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

        let sw = $('#s_autotheme input');
        sw.prop('checked', theme.auto);
        sw.click(_ => {
            theme.autoset(sw.is(':checked'));
        });

        let exb = $('#settings_dial #s_data a#export');
        exb.on('click', _ => {
            let form = $('<input type="text" id="copyPlace">')
            $('#settings_dial #s_data').append(form);
            form.val(JSON.stringify(list.data));
            form.select();
            document.execCommand("copy");
            form.remove();
            exb.addClass('complete');
            exb.text('Copied!');
            debug.log('Exported data to clipboard!', '#00c800')
            alert('Copied data to clipbord!\nMake sure you saved it to safe place!')
            setTimeout(_ => {
                exb.removeClass('complete');
                exb.text('Export');
            }, 1500)
        });
        let inb = $('#settings_dial #s_data a#import');
        inb.on('click', _ => {
            let input = prompt('Enter exported value');
            if (input == null || input.length == 0) return debug.log('Nothing was entered', 'red')
            try {
                let data = JSON.parse(input);
                list.data = data;
                list.update();
                inb.addClass('complete');
                inb.text('Restored!');
                debug.log('Imported data successfully!', '#00c800');
                console.log(data);
            } catch (e) {
                alert(`Error occured:\n${e}`);
                inb.addClass('failed');
                inb.text('Error!');
                debug.log('Error at data import!', 'red');
                console.error(e);
            }
            setTimeout(_ => {
                inb.removeClass('failed');
                inb.removeClass('complete');
                inb.text('Import');
            }, 1500);
        });

        let rall = $('#settings_dial #s_clearall a');
        rall.click(_ => {
            if (!rall.hasClass('crit')) {
                rall.addClass('crit');
                rall.text('Are you sure?');
            } else {
                list.data = [];
                list.update();
                rall.text('Cleared!');
                setTimeout(_ => {
                    rall.removeClass('crit');
                    rall.text('Clear all tasks');
                }, 1500);
            };
        });
    },

};

$(_ => {
    debug.log('DOM loaded', '#fff','#000');

    list.init();
    theme.init();

    $(d).bind('keypress', e => {
        if(e.keyCode==13) {
            debug.log('Pressed enter');
            list.add();
        };
    });

    $(w).on('resize', _ => {
        let width = $(w).width();
        let height = $(w).height();
        if (width < 500) w.resizeTo(500, height);
        if (height < 750) w.resizeTo(width, 750);
    })
});
debug.init();
debug.log('Build '+info.build+'v'+info.version, '#fff','#000');