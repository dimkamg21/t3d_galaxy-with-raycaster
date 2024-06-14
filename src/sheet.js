function onParticleClick(event) {
    onPointerMove(event);
    
    raycaster.setFromCamera(pointer, camera)
    intersects = raycaster.intersectObject(particles);

    const particlesPositionArray = particles.geometry.attributes.position.array;
    const particlesColorArray = particles.geometry.attributes.color.array;
    //   const color = new THREE.Color('red');
  
    if (intersects.length > 0) {
      // Знайти частинку з найменшим значенням distanceToRay
      let closestIntersect = 'huy';
      for (let i = 1; i < intersects.length; i++) {
        if (intersects[i].distanceToRay <= parameters.size / 2) {
          closestIntersect = intersects[i];
        }
      }
  
      if (closestIntersect !== 'huy') {
        for (let i = 0; i < particlesPositionArray.length; i += 3) {
          const x = particlesPositionArray[i    ];
          const y = particlesPositionArray[i + 1];
          const z = particlesPositionArray[i + 2];
          const neighbParticle = new THREE.Vector3(x, y, z);
          
  
          if (neighbParticle.distanceTo(closestIntersect) < 5.0) {
            particlesGeometry.attributes.color.setXYZ(i / 3, 1, 0, 0);
          }
        }
      }
  
      console.log(closestIntersect);
  
      const particleIndex = closestIntersect.index;
      const color = new THREE.Color('red');
      const colors = particles.geometry.attributes.color;
  

      colors.array[particleIndex * 3] = color.r;
      colors.array[particleIndex * 3 + 1] = color.g;
      colors.array[particleIndex * 3 + 2] = color.b;
  

      colors.needsUpdate = true;
    }
  
    // if (intersects.lenght > 0) {
    //   const particle = intersects[0];
    //   console.log(particle);
  
    //   const particlesPositionArray = particles.geometry.attributes.position.array;
    //   const particlesColorArray = particles.geometry.attributes.color.array;
    //   const color = new THREE.Color('red');
     
  
    // }
  }