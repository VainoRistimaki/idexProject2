/*
* Asset from: https://kenney.nl/assets/pixel-platformer
*
*/
import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.centreX;
        this.centreY;
        this.pathY;
        this.pathOffset = 0;
        this.pathOffsetTarget = 0;
        this.pathOffsetMax = 100;
        this.pathHeight = 300;
        this.pathHeightTarget = 300;
        this.pathHeightMin = 50;
        this.pathHeightMax = 200;

        this.score = 0;
        this.distance = 0;
        this.distanceMax = 200;
        this.flyVelocity = -300;
        this.backgroundSpeed = 0;
        this.coinDistance = 0;
        this.coinDistanceMax = 50;
        this.spikeDistance = 0;
        this.spikeDistanceMax = 18;

        this.gameStarted = false;

        this.forwardPressed = 0;
        this.backwardsPressed = 0;

        this.text = "";

        this.enemies = [];

        this.hp = 10;

        this.timer = 0;
        this.points = 0;

        this.text = '';
        this.bullets =[]; 

        this.lastDirection = 1;

        this.pause = false;
        this.started = false;

        this.music = null;
        this.space = false;
    }

    create() {
        this.started = false;
        this.text = ""

        this.space = false;

        this.enemies = []
        this.bullets = []

        this.timer = 0;
        this.points = 0;

        this.hp = 10;

        this.music = this.sound.play('music')

        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;
        this.pathHeight = this.pathHeightMax;

        this.cameras.main.setBackgroundColor(0x00ff00);

        this.background1 = this.add.image(0, 0, 'background').setOrigin(0);
        this.background2 = this.add.image(this.background1.width, 0, 'background').setOrigin(0);

        this.ground1 = this.add.image(0, 580, 'ground').setOrigin(0);
        this.ground2 = this.add.image(this.ground1.width, 580, 'ground').setOrigin(0);

        // Create tutorial text
        this.tutorialText = this.add.text(this.centreX, this.centreY, 'Press any key to start', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(this.centreX, 120, '', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100);

        this.hpText = this.add.text(this.centreX - 300, 50, 'HP: 10', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'right'
        })
            .setOrigin(0.5)
            .setDepth(100);
        
        this.pointsText = this.add.text(this.centreX + 300, 50, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        })
            .setOrigin(0.5)
            .setDepth(100);

        this.typing = this.add.text(30, 150, '', {
            fontFamily: 'Arial', fontSize: 15, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'left'
        })
            .setOrigin(0)
            .setDepth(10);

        this.initAnimations();
        this.initPlayer();
        this.initInput();
        this.initPhysics();

        this.input.keyboard.on('keydown', (event) => {
            let code = ""

            if (event.code.slice(0, 5) == "Digit") {
                code = event.code.slice(5)
            }

            else {
                switch (event.code) {
                    default:
                        code = event.code.slice(3)
                        break;
                    case "Space":
                        code = " "
                        break;
                    case "Enter":
                        code = "\n"
                        break;
                }
            }


            //const code = event.code.slice(3)
            const text = this.action(code)
            this.scoreText.setText(text);
            this.text += code
            this.typing.setText(this.text)

            if (this.typing.width > 760) {
                this.text = this.text.slice(0, this.text.length - 1)
                this.text += '\n' + code
                this.typing.setText(this.text)
            }
        });
/*
        this.input.keyboard.on('keyup', (event) => {
            switch(event.code) {
                case 'KeyM':
                    this.backwardsPressed = 0;
                    break;
                case 'KeyG':
                    this.forwardPressed = 0;
                    break;
            }
        });

 */
    }
    update() {

        if (!this.pause) {
            this.timer -= 0.05

            if (this.timer < 0) {
                console.log("orc")
                this.timer = Math.random() * 10 + 5
                let x = 0
                if (Math.random() > 0.5) {
                    x = -400
                }
                else {
                    x = 1200
                }
                if (Math.random() > 0.5) {
                    this.addOrc(x)
                }
                else (
                    this.addRobot(x)
                )
                
            }



            this.backgroundSpeed = (-this.backwardsPressed + this.forwardPressed)

            this.background1.x -= (this.backgroundSpeed);
            this.background2.x -= (this.backgroundSpeed);

            this.ground1.x -= (this.backgroundSpeed * 2);
            this.ground2.x -= (this.backgroundSpeed * 2);

            this.enemies.forEach((e) => {

                /*
                e.addTimer(0.05)
                
                if (e.timer >= 1 && e.sprite.texture.key == "robot") {
                    console.log("SHOOT")
                    this.shootTazer(e, 1)
                    e.resetTimer()
                }
                */



                if (e.sprite) {
                    e.sprite.x -= (this.backgroundSpeed * 2)
                    /*
                    if (e.sprite.y > 500) {
                        e.sprite.y = 500
                        if (e != undefined && e.sprite != undefined && e.sprite.body != undefined) {
                            e.sprite.body.allowGravity = false
                        }
                    }
                    */

                    this.enemyMove(e)
                }
            })

            const destroyedBullets = [];
            let bulletI = 0;

            this.bullets.forEach((b) => {
                if (b.sprite) {
                    b.sprite.x -= (this.backgroundSpeed * 2)
                    b.sprite.x += b.dir * 10

                    const destroyed = []

                    let i = 0
                    this.enemies.forEach ((e) => {
                        const [destroy, bullet] = this.bulletDamage(b, e)
                        //console.log(bullet);
                        if (destroy) {
                            destroyed.push(i)
                        }
                        if (!bullet) {
                            destroyedBullets.push(bulletI)
                        }
                        i += 1
                    })

                    //this.bulletDamage(b, this.player)

                    destroyed.sort((a, b) => a - b)

                    i = 0;
                    destroyed.forEach( index => {
                        if (this.enemies[index - i]) {
                            if (this.enemies[index - i].sprite) {
                                this.enemies[index - i].sprite.destroy()
                            }
                        }
                        this.enemies.splice(index - i, 1);
                        i += 1
                    })
                }
                bulletI += 1
            })

            destroyedBullets.sort((a, b) => a - b)

            let i = 0;
            destroyedBullets.forEach( index => {
                this.bullets.splice(index - i, 1);
                console.log("NOW")
                i += 1
            })



            if (this.background1.x + this.background1.width < 0) {
                this.background1.x += (this.background1.width * 2);
            }

            if (this.background1.x - this.background1.width > 0) {
                this.background1.x -= (this.background1.width * 2);
            }

            if (this.background2.x + this.background2.width < 0) {
                this.background2.x += (this.background2.width * 2);
            }

            if (this.background2.x - this.background2.width > 0) {
                this.background2.x -= (this.background2.width * 2);
            }


            if (this.ground1.x + this.ground1.width < 0) {
                this.ground1.x += (this.ground1.width * 2);
            }

            if (this.ground1.x - this.ground1.width > 0) {
                this.ground1.x -= (this.ground1.width * 2);
            }

            if (this.ground2.x + this.ground2.width < 0) {
                this.ground2.x += (this.ground2.width * 2);
            }

            if (this.ground2.x - this.ground2.width > 0) {
                this.ground2.x -= (this.ground2.width * 2);
            }

            }

            if (!this.gameStarted) return;

            this.distance += this.backgroundSpeed;
            this.coinDistance += this.backgroundSpeed;
            this.spikeDistance += this.backgroundSpeed;

            if (this.distance > this.distanceMax) {
                this.distance -= this.distanceMax;
                this.randomPath();
            }

            if (this.coinDistance > this.coinDistanceMax) {
                this.coinDistance -= this.coinDistanceMax;
                //this.addCoin();
            }

            if (this.spikeDistance > this.spikeDistanceMax) {
                this.spikeDistance -= this.spikeDistanceMax;
                //this.addSpike();
            }

            this.coinGroup.getChildren().forEach(coin => {
                coin.x -= this.backgroundSpeed;
                coin.refreshBody();
            }, this);

            this.obstacleGroup.getChildren().forEach(obstacle => {
                obstacle.x -= this.backgroundSpeed;
                obstacle.refreshBody();
            }, this);

            this.updatePath();
        
    }

    randomPath() {
        this.pathOffsetTarget = Phaser.Math.RND.between(-this.pathOffsetMax, this.pathOffsetMax);
        this.pathHeightTarget = Phaser.Math.RND.between(this.pathHeightMin, this.pathHeightMax);
    }

    updatePath() {
        const d1 = this.pathOffsetTarget - this.pathOffset;
        const d2 = this.pathHeightTarget - this.pathHeight;

        this.pathOffset += d1 * 0.01;
        this.pathHeight += d2 * 0.01;

        this.pathY = this.centreY + this.pathOffset;
    }

    bulletDamage(bullet, creature) {
        let destroyed = null
        let bulletNow = bullet
        if (this.calculateDistance(bullet.sprite, creature.sprite) < 60) {
            console.log("HELLO")
            destroyed = this.damageCreature(creature)

            bullet.sprite.destroy();
            bulletNow = null
        }
        return [destroyed, bulletNow]
    }

    moveForward() {
        backgroundSpeed = 1
    }

    moveBack() {
        backgroundSpeed = -1
    }

    initAnimations() {
        /*
        this.anims.create({
            key: ANIMATION.bat.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.bat.texture),
            frameRate: ANIMATION.bat.frameRate,
            repeat: ANIMATION.bat.repeat
        });
        */
        this.anims.create({
            key: ANIMATION.coin.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.coin.texture),
            frameRate: ANIMATION.coin.frameRate,
            repeat: ANIMATION.coin.repeat
        });
        
    }

    initPhysics() {
        this.obstacleGroup = this.add.group();
        this.coinGroup = this.add.group();

        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this);
    }

    initPlayer() {
        this.player = this.physics.add.sprite(200, this.centreY, ASSETS.spritesheet.conan.key)
            .setDepth(100)
            .setCollideWorldBounds(true);
        //this.player.anims.play(ANIMATION.bat.key, true);
    }

    initInput() {
        this.physics.pause();
        this.pauseGame()
        
        
        this.input.keyboard.on('keydown', () => {
            if (!this.started) {
                this.startGame();
                this.started = true;
            }
        });
    }

    pauseGame() {
        this.pause = true;
        this.physics.pause();
    }

    unpause() {
        this.pause = false;
        this.physics.resume();
    }

    startGame() {
        //this.unpause()
        this.gameStarted = true;
        this.unpause()
        this.physics.resume();
        /*
        this.input.on('pointerdown', () => {
            this.fly();
        });
*/
        //this.fly();
        this.tutorialText.setVisible(false);
    }

    shootTazer(char, dir) {
        const sprite = this.physics.add.staticSprite(char.x + (dir * 100), char.y, ASSETS.spritesheet.tazer.key)
            .setDepth(100)
        
        const bullet = new Bullet(sprite, dir)
        this.bullets.push(bullet)
        //const enemy = new Enemy(orc, 1)
        //this.enemies.push(enemy);
    }

    damageCreature(creature) {
        creature.hp -= 1
        if (creature.hp <= 0) {
            this.points += 1
            this.pointsText.setText("Score: " + this.points)
            return creature
        }
        return null
    }

    attack(char) {
        if (!this.pause) {
            char.angle = 50;
            setTimeout(() => char.angle = 0 , 100);

            const destroyed = []

            let i = 0
            if (char == this.player) {
                this.enemies.forEach( e => {
                        if (e.sprite != char) {
                            if (this.calculateDistance(e.sprite, char) < 70) {
                                const destroyedEnemy = this.damageCreature(e)
                                if (destroyedEnemy) {
                                    destroyed.push(i)
                                }
                            } 
                        }
                        i += 1
                    }
                )
            }

            destroyed.sort((a, b) => a - b)

            i = 0;
            destroyed.forEach( index => {
                if (this.enemies[index - i].sprite) {
                    this.enemies[index - i].sprite.destroy()
                }
                this.enemies.splice(index - i, 1);
                i += 1
            })

            if (char != this.player) {
                if (this.calculateDistance(char, this.player) < 60) {
                    this.hp -= 1
                    if (this.hp <= 0) {
                        this.GameOver(this.points)
                    }

                this.hpText.setText("HP: " + this.hp)
                } 

            }
        }
    }

    calculateDistance(char1, char2) {
        return (Math.sqrt(Math.pow(char1.x - char2.x, 2) + Math.pow(char1.y - char2.y, 2)))
    }

    action(key) {
        let m = ""

        switch(key) {
            case 'A':
                this.attack(this.player);
                m = 'A - Attack'
                break;
            case 'B':
                this.GameOver(this.points);
                m = `B - Bye Bye`
                break;
            case 'C':
                //console.log(this.player.texture)
                if (this.player.texture.key == 'conan') {
                    this.player.setTexture('super_form')
                }
                else {
                    this.player.setTexture('conan')
                }
                m = 'C - Change Form'
                break;
            case 'D':
                this.GameOver();
                m = `D - Die`
                break;
            case 'E':
                //this.GameOver();
                m = `E - Error`
                setTimeout(() => variable = 0/0 , 100);

                break;
            case 'F':
                this.background1.setTexture('finland');
                this.background2.setTexture('finland');
                this.space = false;
                m = 'F - Finland'
                break;
            case 'G':
                this.forwardPressed = 1;
                this.backwardsPressed = 0;
                this.lastDirection = 1;
                m = `G - Go Forward`
                break;
            case 'H':
                this.hp = 10;
                this.hpText.setText("HP: 10")
                m = 'H - Heal'
                break;
            case 'I':
                m = 'I - Idle'
                break;
            case 'J':
                if (!this.space) {
                    if (this.player.y > 500) {
                        this.fly();
                    }
                }
                else {
                    this.fly();
                }
                m = 'J - Jump'
                break;
            case 'K':
                this.GameOver();
                m = 'K - Kill the Game'
                break;
            case 'L':
                this.GameOver();
                m = 'Lose'
                break;
            case 'M':
                this.backwardsPressed = 1;
                this.forwardPressed = 0;
                this.lastDirection = -1;
                m = `M - Move Backwards`
                break;
            case 'N':
                this.background1.setTexture('background')
                this.background2.setTexture('background')
                this.player.setTexture('conan')
                this.sound.pauseAll()
                this.sound.play("music")
                this.space = false;
                m = 'N - Normal'
                break;
            case 'O':
                this.addOrc(Math.random()*700 + 100)
                m = 'O - Orc'
                break;
            case 'P':
                m = 'P - Pause'
                this.pauseGame()
                break;
            case 'Q':
                this.sound.setVolume(0)
                m = 'Q - Quiet'
                break;
            case 'R':
                m = 'R - Robot'
                this.addRobot(Math.random()*700 + 100)
                break;
            case 'S':
                m = 'S - Save Game'
                break;
            case 'T':
                this.shootTazer(this.player, this.lastDirection)
                m = 'T - Tazer'
                break;
            case 'U':
                m = 'U - Unpause'
                this.unpause()
                break;
            case 'V':
                this.sound.setVolume(this.sound.volume + 0.1);
                m = 'Volume Up'
                break;
            case 'W':
                this.GameOver();
                m = 'W - Win'
                break; 
            case 'X':
                this.background1.setTexture('finland');
                this.background2.setTexture('finland');
                this.space = false;
                m = 'X - Xylitol Country'
                break;
            case 'Y':
                this.sound.play('scream')
                m = 'Y - Yell'
                break; 
            case 'Z':
                m = 'Z - Zero Points'
                this.points = 0;
                this.pointsText.setText("Score: 0")
                break;
            case ' ':
                this.background1.setTexture('space');
                this.background2.setTexture('space');
                this.space = true;
                m = 'Space - Space'
                break;
            case '\n':
                //this.sound.on('stopall', listener)
                this.sound.pauseAll()
                this.sound.play("enter")
                m = "Enter - Enter Sandman"
                break;
            case '1':
                m = "1 - 1st Action"
                if (this.text[0] && this.text[0] != '1') {
                    this.action(this.text[0])
                }
                break;
            case '2':
                m = "2 - 2nd to Last Action"
                const index = this.text.length - 2
                if (this.text[index] && this.text[index] != '2') {
                    this.action(this.text[index])
                }
                break;
            case '3':
                m = "3 - 3x Health"
                this.hp = this.hp * 3
                this.hpText.setText("HP: "+ this.hp)
                break;
            case '4':
                m = `4 - 4th Wall Break: "Hello Player"`
                break;
            case '5':
                m = '5 - 5 Times the Last Action'
                const index2 = this.text.length - 1
                if (this.text[index2] && this.text[index2] != '5') {
                    this.action(this.text[index2])
                    setTimeout(() => this.action(this.text[index2]), 300);
                    setTimeout(() => this.action(this.text[index2]), 600);
                    setTimeout(() => this.action(this.text[index2]), 900);
                    setTimeout(() => this.action(this.text[index2]), 1200);
                }
                break;
            case '6':
                m = "6 - 6 Health"
                this.hp = 6
                this.hpText.setText("HP: 6")
                break; 
        }
        return m
    }

    addCoin() {
        const coin = this.physics.add.staticSprite(this.scale.width + 50, this.pathY, ASSETS.spritesheet.coin.key);
        coin.anims.play(ANIMATION.coin.key, true);
        this.coinGroup.add(coin);
    }

    addSpike() {
        const spikeTop = this.physics.add.staticSprite(this.scale.width + 50, this.pathY - this.pathHeight, 'spikes').setFlipY(true);
        const spikeBottom = this.physics.add.staticSprite(this.scale.width + 50, this.pathY + this.pathHeight, 'spikes');
        this.obstacleGroup.add(spikeTop);
        this.obstacleGroup.add(spikeBottom);
    }

    fly() {
        this.player.setVelocityY(this.flyVelocity);
    }

    addOrc(x) {
        const orc = this.physics.add.staticSprite(x, 510, ASSETS.spritesheet.orc.key)
            .setDepth(100)
        const enemy = new Enemy(orc, 1)
        this.enemies.push(enemy);
    }

    addRobot(x) {
        const robot = this.physics.add.staticSprite(x, 510, ASSETS.spritesheet.robot.key)
            .setDepth(100)
        const enemy = new Enemy(robot, 1)
        this.enemies.push(enemy);

    }

    enemyMove(enemy) {
        const speed = 2.2

        if (!enemy.wait) {

            if (this.calculateDistance(enemy.sprite, this.player) > 40) {
                if (enemy.sprite.x < this.player.x) {
                    enemy.sprite.x += speed
                }
                else (
                    enemy.sprite.x -= speed
                )
            }

            else {
                this.attack(enemy.sprite)
                enemy.wait = true;
                setTimeout(() => enemy.wait = false , 2000);

            }
        }
    }

    hitObstacle(player, obstacle) {
        this.gameStarted = false;
        this.physics.pause();

        this.tweens.add({
            targets: this.player,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: Phaser.Math.Easing.Expo.Out
        });

        this.GameOver();
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score++;
        //this.scoreText.setText(`Score: ${this.score}`);
    }

    GameOver() {
        this.time.delayedCall(500, () => {
            this.scene.start('GameOver', {points: this.points});
        });
    }
}

class Enemy {
    constructor(sprite, hp) {
        this.sprite = sprite
        this.hp = hp;
        this.wait = false;

        this.timer = 0;

        //setInterval(() => this.doThing() , 2000);
    }

    addTimer(add) {
        this.timer += add
    }

    resetTimer() {
        this.timer = 0
    }

    /*
    doThing() {
        if (this.sprite.texture.key == "robot") {
            this.shootTazer(this.sprite, -1)
        }
    }
    */
}

class Bullet {
    constructor(sprite, dir) {
        this.sprite = sprite
        this.dir = dir
    }
}
