const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// const helmet = require('helmet');  孩子，这个真的用不上
// const crypto = require('crypto'); 内联再也不见
const path = require('path');
const app = express();

const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/swiper', express.static(path.join(__dirname, 'node_modules/swiper')));
// app.use(setCSPHeader);
// 那gameInit页的内联Script真的绝绝子啊
// app.use((req, res, next) => {
//     const nonce = crypto.randomBytes(16).toString('base64');
//     res.locals.nonce = nonce;
//     res.setHeader("Content-Security-Policy",
//         `default-src 'self'; ` +
//         `script-src 'self' 'nonce-${nonce}'; ` +
//         `style-src 'self' 'nonce-${nonce}'; ` +
//         `img-src 'self' http://localhost:3000`
//     );
//     next();
// });

let db = new sqlite3.Database('./db/game.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the game database.');
});

app.post('/api/player', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO personal_attributes(name) VALUES(?)`, [name], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.json({ id: this.lastID });
    });
});


app.get('/api/player/:id', (req, res) => {
    const playerId = req.params.id;
    db.get(`SELECT * FROM personal_attributes WHERE id = ?`, [playerId], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

app.get('/api/game_settings/:id', (req, res) => {
    const playerId = req.params.id;
    db.get('SELECT * FROM game_settings WHERE id = ?', [playerId], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Settings not found' });
            return;
        }
        res.json(row);
    });
});

app.get('/api/character_relationships/:id?', (req, res) => {
    const playerId = req.params.id;
    let sql;
    let params = [];

    if (playerId) {
        sql = 'SELECT * FROM character_relationships WHERE id = ?';
        params = [playerId];
    } else {
        sql = 'SELECT * FROM character_relationships';
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!rows.length) {
            res.status(404).json({ error: 'Relationships not found' });
            return;
        }
        res.json(rows);
    });
});
// 更新位置的路由
app.post('/updateLocation', (req, res) => {
    const { newLocation, userId } = req.body; // 直接从请求体中获取userId和newLocation

    if (!newLocation || !userId) {
        return res.status(400).json({ error: '缺少必要的参数' });
    }

    db.run('UPDATE personal_attributes SET site = ? WHERE id = ?', [newLocation, userId], (err) => {
        if (err) {
            console.error('数据库更新错误:', err);
            return res.status(500).json({ error: '更新位置失败' });
        } else {
            return res.json({ message: '更新成功' });
        }
    });
});

// 孩子们，我被这个坑惨了。express.static这个中间件太老银币了，发现index.html就返回index害得我跳转一直失败。
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'intro.html'));
});

// 处理游戏页面请求
app.get('/gameInit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gameMain.html'));
});


app.get('/myBeds', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'myBeds.html'));
});

app.get('/shiSho', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'shiSho.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
