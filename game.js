
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false }},
    scene: { preload, create, update }
};

let player, cursors, artifacts, collected = [], timerText, exit, timedEvent;
let scoreText, badItem, reverseControl = false, slowed = false;
let soundPickup;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('map', 'assets/maps/map.png');
    this.load.image('player', 'assets/player/player.png');
    this.load.image('불국사', 'assets/artifacts/artifact1.png');
    this.load.image('첨성대', 'assets/artifacts/artifact2.png');
    this.load.image('출구', 'assets/artifacts/exit.png');
    this.load.image('오답', 'assets/artifacts/wrong.png');
    this.load.audio('pickup', 'assets/audio/pickup.wav');
}

function create() {
    this.add.image(400, 300, 'map');
    player = this.physics.add.sprite(100, 100, 'player').setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();
    soundPickup = this.sound.add('pickup');

    artifacts = this.physics.add.staticGroup();
    artifacts.create(300, 250, '불국사').setName('불국사');
    artifacts.create(500, 350, '첨성대').setName('첨성대');
    exit = this.physics.add.staticImage(750, 550, '출구').setName('출구');
    badItem = this.physics.add.staticImage(600, 200, '오답').setName('오답');

    this.physics.add.overlap(player, artifacts, collectArtifact, null, this);
    this.physics.add.overlap(player, badItem, triggerPenalty, null, this);
    this.physics.add.overlap(player, exit, tryExit, null, this);

    timerText = this.add.text(16, 560, '', { fontSize: '20px', fill: '#fff' });
    timedEvent = this.time.addEvent({ delay: 30000, callback: timeOver, callbackScope: this });

    updateCollectionUI();
}

function update() {
    player.setVelocity(0);
    let speed = slowed ? 80 : 150;

    if (reverseControl) {
        if (cursors.left.isDown) player.setVelocityX(speed);
        else if (cursors.right.isDown) player.setVelocityX(-speed);
        if (cursors.up.isDown) player.setVelocityY(speed);
        else if (cursors.down.isDown) player.setVelocityY(-speed);
    } else {
        if (cursors.left.isDown) player.setVelocityX(-speed);
        else if (cursors.right.isDown) player.setVelocityX(speed);
        if (cursors.up.isDown) player.setVelocityY(-speed);
        else if (cursors.down.isDown) player.setVelocityY(speed);
    }

    const remaining = Math.ceil((30000 - timedEvent.getElapsed()) / 1000);
    timerText.setText('남은 시간: ' + remaining + '초');
}

function collectArtifact(player, artifact) {
    const name = artifact.name;
    if (!collected.includes(name)) {
        collected.push(name);
        artifact.destroy();
        soundPickup.play();
        alert(name + " 유물을 수집했습니다!");
        updateCollectionUI();
    }
}

function triggerPenalty(player, item) {
    item.destroy();
    alert("❌ 잘못된 유물을 수집했습니다! 속도가 느려지고 조작이 혼란스러워집니다.");
    slowed = true;
    reverseControl = true;
    setTimeout(() => { slowed = false; reverseControl = false; }, 5000);
}

function tryExit(player, exit) {
    if (collected.length >= 2) {
        alert('🎉 성공! 유물을 모두 수집하고 탈출했습니다.');
    } else {
        alert('❗ 유물을 아직 다 수집하지 않았습니다.');
    }
    location.reload();
}

function timeOver() {
    alert('⏰ 시간 초과! 게임 실패!');
    location.reload();
}

function updateCollectionUI() {
    const el = document.getElementById('info');
    if (el) el.innerText = `수집한 유물: ${collected.length}/2`;
}
