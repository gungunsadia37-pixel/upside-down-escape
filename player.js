import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.laneWidth = 2.5;
    this.currentLane = 1; // 0, 1, 2
    this.targetX = 0;
    
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 0.5
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(0, 1, 0);
    scene.add(this.mesh);
    
    this.setupControls();
  }
  
  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.moveLane(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') this.moveLane(1);
      if (e.key === ' ' || e.key === 'ArrowUp') this.shoot();
    });
  }
  
  moveLane(direction) {
    this.currentLane = Math.max(0, Math.min(2, this.currentLane + direction));
    this.targetX = (this.currentLane - 1) * this.laneWidth;
  }
  
  shoot() {
    console.log('Bang!');
    // We'll add shooting in Phase 3
  }
  
  update(delta) {
    // Smooth lane transition
    this.mesh.position.x += (this.targetX - this.mesh.position.x) * 10 * delta;
  }
}