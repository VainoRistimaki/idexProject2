export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
        
    }

    init(data){
        this.points = data.points;
    }

    create() {
        this.background1 = this.add.image(0, 0, 'background').setOrigin(0);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over! Score: ' + this.points, {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }
}
