import * as THREE from 'three';
import { Player } from './player.js';
import { BulletManager, EnemySpawner } from './enemies.js';

// ---------- Scene setup ----------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0015, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('gameCanvas'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// ---------- Lights ----------
const ambient = new THREE.AmbientLight(0x442266, 1.5);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xff4444, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ---------- Ground ----------
const groundGeo = new THREE.PlaneGeometry(9, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2a });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ---------- Game objects ----------
const player = new Player(scene);
const bullets = new BulletManager(scene);
const spawner = new EnemySpawner(scene);

// Hook player's shoot to bullets
player.shoot = function () {
  bullets.fire(this.mesh.position.x, this.mesh.position.z - 1);
};

// ---------- Game state ----------
let score = 0;
let health = 3;
let gameSpeed = 15;

const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');

function updateHealth() {
  healthEl.textContent = '❤️'.repeat(Math.max(0, health));
}

function gameOver() {
  alert(`Game Over! Score: ${score}`);
  location.reload();
}

// ---------- Collision ----------
const playerBox = new THREE.Box3();

function checkCollisions() {
  playerBox.setFromObject(player.mesh);

  // Bullets vs Enemies
  for (let i = bullets.bullets.length - 1; i >= 0; i--) {
    const b = bullets.bullets[i];
    const bBox = new THREE.Box3().setFromObject(b);

    for (let j = spawner.enemies.length - 1; j >= 0; j--) {
      const e = spawner.enemies[j];
      const eBox = new THREE.Box3().setFromObject(e.mesh);

      if (bBox.intersectsBox(eBox)) {
        scene.remove(b);
        bullets.bullets.splice(i, 1);
        e.destroy();
        spawner.enemies.splice(j, 1);
        score += 10;
        scoreEl.textContent = `Score: ${score}`;
        break;
      }
    }
  }

  // Player vs Enemies
  for (let j = spawner.enemies.length - 1; j >= 0; j--) {
    const e = spawner.enemies[j];
    const eBox = new THREE.Box3().setFromObject(e.mesh);
    if (playerBox.intersectsBox(eBox)) {
      e.destroy();
      spawner.enemies.splice(j, 1);
      health--;
      updateHealth();
      if (health <= 0) gameOver();
    }
  }
}

// ---------- Animation loop ----------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  player.update(delta);
  spawner.update(delta, gameSpeed);
  bullets.update(delta);
  checkCollisions();

  renderer.render(scene, camera);
}
animate();

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});