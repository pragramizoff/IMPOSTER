<?php
define('DB_PATH', __DIR__ . '/data/game.db');

function getDB() {
    if (!is_dir(__DIR__ . '/data')) {
        mkdir(__DIR__ . '/data', 0755, true);
    }
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("PRAGMA journal_mode = WAL");
    initDB($db);
    return $db;
}

function initDB($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        category TEXT DEFAULT 'umumiy',
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $count = $db->query("SELECT COUNT(*) FROM words")->fetchColumn();
    if ($count == 0) {
        insertDefaultWords($db);
    }
}

function insertDefaultWords($db) {
    $words = [
        // Oziq-ovqat
        ['non', 'taom'], ['osh', 'taom'], ["go'sht", 'taom'], ['sabzi', 'taom'],
        ['piyoz', 'taom'], ['pomidor', 'taom'], ['tarvuz', 'taom'], ['qovun', 'taom'],
        ['uzum', 'taom'], ['olma', 'taom'], ["o'rik", 'taom'], ['shaftoli', 'taom'],
        ['limon', 'taom'], ['apelsin', 'taom'], ['banan', 'taom'], ['anor', 'taom'],
        ['anjir', 'taom'], ['nok', 'taom'], ['gilos', 'taom'], ['malina', 'taom'],
        ['kartoshka', 'taom'], ['karam', 'taom'], ['bodring', 'taom'], ['qalampir', 'taom'],
        ['sarimsoq', 'taom'], ['loviya', 'taom'], ['guruch', 'taom'], ['tuxum', 'taom'],
        ['baliq', 'taom'], ['tovuq', 'taom'], ['asal', 'taom'], ['qatiq', 'taom'],
        ['sut', 'taom'], ['qovoq', 'taom'], ['makkajo\'xori', 'taom'], ['shirin', 'taom'],

        // Joylar
        ['maktab', 'joy'], ['bozor', 'joy'], ['shifoxona', 'joy'], ['kutubxona', 'joy'],
        ['stadion', 'joy'], ['kino', 'joy'], ['restoran', 'joy'], ["do'kon", 'joy'],
        ['mehmonxona', 'joy'], ['bank', 'joy'], ['pochta', 'joy'], ['masjid', 'joy'],
        ['muzey', 'joy'], ["bog'", 'joy'], ['park', 'joy'], ['aeroport', 'joy'],
        ['metro', 'joy'], ['hammom', 'joy'], ['sport zal', 'joy'], ['zavod', 'joy'],
        ['idora', 'joy'], ['universitet', 'joy'], ['zoopark', 'joy'], ['sirk', 'joy'],
        ['teatr', 'joy'], ['oshxona', 'joy'], ['konditeriya', 'joy'], ['dorixona', 'joy'],

        // Hayvonlar
        ['mushuk', 'hayvon'], ['it', 'hayvon'], ['ot', 'hayvon'], ['sigir', 'hayvon'],
        ["qo'y", 'hayvon'], ['echki', 'hayvon'], ['tovuq', 'hayvon'], ["o'rdak", 'hayvon'],
        ["g'oz", 'hayvon'], ['tuya', 'hayvon'], ['fil', 'hayvon'], ['sher', 'hayvon'],
        ["yo'lbars", 'hayvon'], ['ayiq', 'hayvon'], ["bo'ri", 'hayvon'], ['tulki', 'hayvon'],
        ['quyon', 'hayvon'], ['kiyik', 'hayvon'], ['maymun', 'hayvon'], ['zebra', 'hayvon'],
        ['timsoh', 'hayvon'], ['ilon', 'hayvon'], ['qurbaqа', 'hayvon'], ['asalari', 'hayvon'],
        ['kapalak', 'hayvon'], ['eshak', 'hayvon'], ['qoʻzichoq', 'hayvon'], ['buqa', 'hayvon'],

        // Buyumlar
        ['kitob', 'buyum'], ['qalam', 'buyum'], ['stol', 'buyum'], ['kursi', 'buyum'],
        ['deraza', 'buyum'], ['eshik', 'buyum'], ['soat', 'buyum'], ['telefon', 'buyum'],
        ['televizor', 'buyum'], ['kompyuter', 'buyum'], ['sumka', 'buyum'], ['kamar', 'buyum'],
        ['ko\'ylak', 'buyum'], ['shim', 'buyum'], ['poyabzal', 'buyum'], ['shlyapa', 'buyum'],
        ['uzuk', 'buyum'], ['ko\'zgу', 'buyum'], ['qoshiq', 'buyum'], ['vilka', 'buyum'],
        ['piyola', 'buyum'], ['tovoq', 'buyum'], ['kalit', 'buyum'], ['narvon', 'buyum'],
        ['supurgi', 'buyum'], ['qaychi', 'buyum'], ['igna', 'buyum'], ['mato', 'buyum'],

        // Sport
        ['futbol', 'sport'], ['basketbol', 'sport'], ['voleybol', 'sport'], ['tennis', 'sport'],
        ['suzish', 'sport'], ['yugurish', 'sport'], ['velosiped', 'sport'], ['kurash', 'sport'],
        ['boks', 'sport'], ['gimnastika', 'sport'],

        // Kasb
        ['shifokor', 'kasb'], ['o\'qituvchi', 'kasb'], ['haydovchi', 'kasb'], ['oshpaz', 'kasb'],
        ['dehqon', 'kasb'], ['askar', 'kasb'], ['militsiya', 'kasb'], ['muhandis', 'kasb'],

        // Tabiat
        ['daraxt', 'tabiat'], ['gul', 'tabiat'], ['dарyo', 'tabiat'], ['tog\'', 'tabiat'],
        ['qor', 'tabiat'], ['yomg\'ir', 'tabiat'], ['shamol', 'tabiat'], ['quyosh', 'tabiat'],
        ['oy', 'tabiat'], ['yulduz', 'tabiat'], ['bulut', 'tabiat'], ['tosh', 'tabiat'],
    ];

    $stmt = $db->prepare("INSERT OR IGNORE INTO words (word, category) VALUES (?, ?)");
    foreach ($words as $w) {
        $stmt->execute([$w[0], $w[1]]);
    }
}
