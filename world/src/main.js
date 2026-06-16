import Boot          from './Boot.js';
import MenuScene     from './MenuScene.js';
import WorldScene    from './WorldScene.js';
import RoomScene     from './RoomScene.js';
import WardrobeScene from './WardrobeScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 390,
  height: 844,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, MenuScene, WorldScene, RoomScene, WardrobeScene],
};

const game = new Phaser.Game(config);
export default game;
