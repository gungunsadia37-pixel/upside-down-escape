import * as THREE from 'three';
import { Player } from './player.js';
import { BulletManager, EnemySpawner } from './enemies.js';
const playerBox = new THREE.Box3();
// 1. Create scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0015, 0.02); // dark fog

// 2. Create camera (behind player)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8);

// 3. Create renderer
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('gameCanvas'),
  antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. Add lights
const ambient = new THREE.AmbientLight(0x442266, 1.5);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xff4444, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// 5. Add a test cube (this will be your player later)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff3333,
  emissive: 0xff0000,
  emissiveIntensity: 0.5
});
const player = new THREE.Mesh(geometry, material);
player.position.set(0, 1, 0);
scene.add(player);

// 6. Ground plane
const groundGeo = new THREE.PlaneGeometry(9, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2a });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 7. Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 8. Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
const player = new Player(scene);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  player.update(delta);
  renderer.render(scene, camera);
}
animate();
const bullets = new BulletManager(scene);
const spawner = new EnemySpawner(scene);

// Modify Player.shoot to use bullets
player.shoot = function() {
  bullets.fire(this.mesh.position.x, this.mesh.position.z - 1);
};

// In animate():
let gameSpeed = 15; // units per second
spawner.update(delta, gameSpeed);
bullets.update(delta);

function checkCollisions() {
  playerBox.setFromObject(player.mesh);
  
  // Bullet vs Enemy
  for (let i = bullets.bullets.length - 1; i >= 0; i--) {
    const b = bullets.bullets[i];
    const bBox = new THREE.Box3().setFromObject(b);
    
    for (let j = spawner.enemies.length - 1; j >= 0; j--) {
      const e = spawner.enemies[j];
      const eBox = new THREE.Box3().setFromObject(e.mesh);
      
      if (bBox.intersectsBox(eBox)) {
        scene.remove(b); bullets.bullets.splice(i, 1);
        e.destroy(); spawner.enemies.splice(j, 1);
        score += 10;
        document.getElementById('score').textContent = `Score: ${score}`;
        break;
      }
    }
  }
  
  // Player vs Enemy
  for (let j = spawner.enemies.length - 1; j >= 0; j--) {
    const e = spawner.enemies[j];
    const eBox = new THREE.Box3().setFromObject(e.mesh);
    if (playerBox.intersectsBox(eBox)) {
      e.destroy(); spawner.enemies.splice(j, 1);
      health--;
      updateHealth();
      if (health <= 0) gameOver();
    }
  }
}

let score = 0;
let health = 3;
function updateHealth() {
  document.getElementById('health').textContent = '❤️'.repeat(Math.max(0, health));
}
function gameOver() {
  alert(`Game Over! Score: ${score}`);
  location.reload();
}