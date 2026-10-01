import * as THREE from 'three';

export class BulletManager {
  constructor(scene) {
    this.scene = scene;
    this.bullets = [];
    this.geo = new THREE.SphereGeometry(0.15, 8, 8);
    this.mat = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2
    });
  }
  
  fire(x, z) {
    const bullet = new THREE.Mesh(this.geo, this.mat);
    bullet.position.set(x, 1, z);
    this.scene.add(bullet);
    this.bullets.push(bullet);
  }
  
  update(delta) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.position.z -= 40 * delta; // move forward
      if (b.position.z < -100) {
        this.scene.remove(b);
        this.bullets.splice(i, 1);
      }
    }
  }
}

export class Enemy {
  constructor(scene, laneX, z) {
    const geo = new THREE.ConeGeometry(0.8, 2, 6);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0x44ff44, emissive: 0x22ff22, emissiveIntensity: 0.8
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(laneX, 1, z);
    this.mesh.rotation.x = Math.PI;
    scene.add(this.mesh);
    this.scene = scene;
    this.alive = true;
  }
  
  update(delta, gameSpeed) {
    this.mesh.position.z += gameSpeed * delta;
    if (this.mesh.position.z > 10) this.alive = false;
  }
  
  destroy() {
    this.scene.remove(this.mesh);
    this.alive = false;
  }
}

export class EnemySpawner {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.timer = 0;
    this.interval = 1.5; // seconds
    this.laneWidth = 2.5;
  }
  
  update(delta, gameSpeed) {
    this.timer += delta;
    if (this.timer >= this.interval) {
      this.timer = 0;
      const lane = Math.floor(Math.random() * 3);
      const x = (lane - 1) * this.laneWidth;
      this.enemies.push(new Enemy(this.scene, x, -80));
    }
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(delta, gameSpeed);
      if (!e.alive) {
        this.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
      }
    }
  }
}