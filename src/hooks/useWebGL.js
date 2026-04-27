import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function useWebGL(ref) {
  const scrollY = useRef(0)
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.setSize(innerWidth, innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 600)
    camera.position.set(0, 0, 20)
    scene.fog = new THREE.FogExp2(0x07080d, 0.022)

    scene.add(new THREE.AmbientLight(0x050510, 1))
    const blueLight = new THREE.PointLight(0x00e5ff, 5, 50)
    blueLight.position.set(6, 6, 12)
    scene.add(blueLight)
    const orangeLight = new THREE.PointLight(0xff6b35, 3, 40)
    orangeLight.position.set(-8, -3, 8)
    scene.add(orangeLight)
    const topLight = new THREE.PointLight(0xffffff, 1.5, 30)
    topLight.position.set(0, 12, 0)
    scene.add(topLight)

    const starsGeo = new THREE.BufferGeometry()
    const sp = new Float32Array(3000 * 3)
    for (let i = 0; i < 3000; i++) {
      sp[i * 3]     = (Math.random() - 0.5) * 250
      sp[i * 3 + 1] = (Math.random() - 0.5) * 250
      sp[i * 3 + 2] = (Math.random() - 0.5) * 250
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    scene.add(new THREE.Points(starsGeo,
      new THREE.PointsMaterial({ color: 0x8ab4d8, size: 0.15, transparent: true, opacity: 0.5 })))

    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x0a1520, metalness: 0.9, roughness: 0.1 })
    const nodeEdgeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.15 })
    const nodes = []

    for (let i = 0; i < 9; i++) {
      const r = 0.4 + Math.random() * 0.9
      const geo = new THREE.IcosahedronGeometry(r, 1)
      const mesh = new THREE.Mesh(geo, nodeMat.clone())
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 4
      )
      scene.add(mesh)
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), nodeEdgeMat.clone())
      edge.position.copy(mesh.position)
      scene.add(edge)
      nodes.push({
        mesh, edge,
        speed: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      })
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.06 })
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].mesh.position.distanceTo(nodes[j].mesh.position) < 11) {
          const g = new THREE.BufferGeometry().setFromPoints([
            nodes[i].mesh.position.clone(),
            nodes[j].mesh.position.clone(),
          ])
          scene.add(new THREE.Line(g, lineMat))
        }
      }
    }

    const octGeo  = new THREE.OctahedronGeometry(3.2, 0)
    const octMat  = new THREE.MeshStandardMaterial({ color: 0x08121e, metalness: 0.95, roughness: 0.08 })
    const oct     = new THREE.Mesh(octGeo, octMat)
    oct.position.set(7, -0.5, 0)
    scene.add(oct)
    const octEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(octGeo),
      new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.22 }),
    )
    octEdge.position.copy(oct.position)
    scene.add(octEdge)

    const aGeo = new THREE.BufferGeometry()
    const ap   = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      const r2 = 4 + Math.random() * 12
      const t2 = Math.random() * Math.PI * 2
      const p2 = Math.acos(2 * Math.random() - 1)
      ap[i * 3]     = r2 * Math.sin(p2) * Math.cos(t2) + 7
      ap[i * 3 + 1] = r2 * Math.sin(p2) * Math.sin(t2) - 0.5
      ap[i * 3 + 2] = r2 * Math.cos(p2)
    }
    aGeo.setAttribute('position', new THREE.BufferAttribute(ap, 3))
    const accentParticles = new THREE.Points(aGeo,
      new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.08, transparent: true, opacity: 0.55 }))
    scene.add(accentParticles)

    const grid = new THREE.GridHelper(120, 60, 0x00e5ff, 0x0a1520)
    grid.position.y = -10
    grid.material.transparent = true
    grid.material.opacity = 0.18
    scene.add(grid)

    let cX = 0, cY = 0, tX = 0, tY = 0
    const onMouseMove = (e) => {
      tX = (e.clientX / innerWidth  - 0.5) * 2
      tY = -(e.clientY / innerHeight - 0.5) * 2
      mouseX.current = tX
      mouseY.current = tY
    }
    const onScroll = () => { scrollY.current = window.scrollY }
    const onResize = () => {
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight)
    }
    document.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll',      onScroll)
    window.addEventListener('resize',      onResize)

    const clock = new THREE.Clock()
    let animId

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      cX += (tX - cX) * 0.04
      cY += (tY - cY) * 0.04
      const scrollProgress = scrollY.current / (document.body.scrollHeight - innerHeight) || 0
      camera.position.z += (20 - scrollProgress * 9 - camera.position.z) * 0.06
      camera.position.y += (scrollProgress * 4 - camera.position.y) * 0.06
      camera.position.x  = cX * 2
      camera.lookAt(cX * 0.4, cY * 0.4 + scrollProgress * 2, 0)

      nodes.forEach(n => {
        n.mesh.rotateOnAxis(n.axis, n.speed * 0.01)
        n.edge.rotation.copy(n.mesh.rotation)
        n.mesh.position.y += Math.sin(t * 0.4 + n.phase) * 0.003
        n.edge.position.copy(n.mesh.position)
      })

      oct.rotation.x = t * 0.14 + cY * 0.25
      oct.rotation.y = t * 0.20 + cX * 0.25
      oct.position.y = -0.5 + Math.sin(t * 0.5) * 0.5
      octEdge.rotation.copy(oct.rotation)
      octEdge.position.y = oct.position.y

      blueLight.position.x  = Math.sin(t * 0.4) * 8 + 4
      blueLight.position.y  = Math.cos(t * 0.3) * 5 + 4
      orangeLight.position.x = Math.cos(t * 0.28) * 10 - 5
      orangeLight.position.z = Math.sin(t * 0.22) * 6 + 5

      accentParticles.rotation.y = t * 0.035
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll',      onScroll)
      window.removeEventListener('resize',      onResize)
      renderer.dispose()
    }
  }, [ref])
}
