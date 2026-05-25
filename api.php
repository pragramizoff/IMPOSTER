<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    $db = getDB();

    switch ($action) {

        case 'random_word':
            $word = $db->query("SELECT word, category FROM words WHERE active = 1 ORDER BY RANDOM() LIMIT 1")->fetch(PDO::FETCH_ASSOC);
            if (!$word) {
                echo json_encode(['error' => "So'z topilmadi"]);
            } else {
                echo json_encode(['success' => true, 'word' => $word['word'], 'category' => $word['category']]);
            }
            break;

        case 'words':
            $category = $_GET['category'] ?? '';
            if ($category) {
                $stmt = $db->prepare("SELECT * FROM words WHERE category = ? ORDER BY category, word");
                $stmt->execute([$category]);
            } else {
                $stmt = $db->query("SELECT * FROM words ORDER BY category, word");
            }
            $words = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total = $db->query("SELECT COUNT(*) FROM words")->fetchColumn();
            $active = $db->query("SELECT COUNT(*) FROM words WHERE active = 1")->fetchColumn();
            echo json_encode([
                'success' => true,
                'words' => $words,
                'total' => (int)$total,
                'active' => (int)$active
            ]);
            break;

        case 'categories':
            $cats = $db->query("SELECT category, COUNT(*) as count FROM words GROUP BY category ORDER BY category")->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'categories' => $cats]);
            break;

        case 'add_word':
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $word = trim($data['word'] ?? '');
            $category = trim($data['category'] ?? 'umumiy');

            if (empty($word)) {
                echo json_encode(['error' => "So'z kiritilmadi"]);
                break;
            }
            if (mb_strlen($word) > 50) {
                echo json_encode(['error' => "So'z juda uzun"]);
                break;
            }

            $check = $db->prepare("SELECT id FROM words WHERE word = ?");
            $check->execute([$word]);
            if ($check->fetch()) {
                echo json_encode(['error' => "Bu so'z allaqachon mavjud"]);
                break;
            }

            $stmt = $db->prepare("INSERT INTO words (word, category) VALUES (?, ?)");
            $stmt->execute([$word, $category]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId(), 'message' => "So'z qo'shildi"]);
            break;

        case 'toggle_word':
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $id = (int)($data['id'] ?? 0);
            if (!$id) { echo json_encode(['error' => 'ID kerak']); break; }

            $stmt = $db->prepare("UPDATE words SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?");
            $stmt->execute([$id]);
            $word = $db->prepare("SELECT active FROM words WHERE id = ?");
            $word->execute([$id]);
            $row = $word->fetch();
            echo json_encode(['success' => true, 'active' => (int)$row['active']]);
            break;

        case 'delete_word':
            $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
            $id = (int)($data['id'] ?? 0);
            if (!$id) { echo json_encode(['error' => 'ID kerak']); break; }

            $total = $db->query("SELECT COUNT(*) FROM words WHERE active = 1")->fetchColumn();
            if ($total <= 5) {
                echo json_encode(['error' => "Kamida 5 ta so'z bo'lishi kerak"]);
                break;
            }

            $stmt = $db->prepare("DELETE FROM words WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => "So'z o'chirildi"]);
            break;

        case 'stats':
            $total = $db->query("SELECT COUNT(*) FROM words")->fetchColumn();
            $active = $db->query("SELECT COUNT(*) FROM words WHERE active = 1")->fetchColumn();
            $cats = $db->query("SELECT category, COUNT(*) as c FROM words WHERE active=1 GROUP BY category")->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'total' => (int)$total, 'active' => (int)$active, 'categories' => $cats]);
            break;

        default:
            echo json_encode(['error' => 'Noto\'g\'ri so\'rov']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Server xatosi: ' . $e->getMessage()]);
}
