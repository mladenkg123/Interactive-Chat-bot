import { useCallback, useEffect } from 'react';
import { IShapeDrawData, IShapeDrawer, Particle, tsParticles } from '@tsparticles/engine';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import './Particle.css';

export class FlowerDrawer implements IShapeDrawer<Particle> {
  validTypes = ['flower'];
  draw(data: IShapeDrawData<Particle>): void {
    const { context, radius } = data;

    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.moveTo(0, 0);
    context.lineTo(radius, 0);
    context.stroke();
  }
}

export class SquareDrawer implements IShapeDrawer<Particle> {
  validTypes = ['square'];
  draw(data: IShapeDrawData<Particle>): void {
    const { context, radius } = data;
    context.beginPath();
    context.rect(0, 0, radius * 2, radius * 2);
    context.stroke();
  }
}

const ParticleComponent = () => {
  const particlesInit = async () => {
    await loadSlim(tsParticles);

    // Add custom shapes
    tsParticles.addShape(new FlowerDrawer());
    tsParticles.addShape(new SquareDrawer());
  };
  const particlesLoaded = useCallback(async () => {}, []);
  useEffect(() => {
    particlesInit();

    // Cleanup function to destroy particles when the component unmounts
    return () => {
      const containers = tsParticles.dom();
      containers.forEach((container) => container.destroy());
    };
  }, [particlesInit]);

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: '#040c1c',
          },
        },
        fpsLimit: 999,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
            onHover: {
              enable: true,
              mode: 'repulse',
            },
          },
          modes: {
            push: {
              quantity: 2,
            },
            repulse: {
              distance: 100,
              duration: 0.3,
            },
          },
        },
        particles: {
          color: {
            value: '#ffffff',
          },
          links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.14,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 1.25,
            straight: false,
          },
          number: {
            density: {
              enable: true,
            },
            value: 80,
          },
          opacity: {
            value: 0.15,
          },
          shape: {
            type: ['circle', 'flower', 'square'],
          },
          size: {
            value: { min: 1, max: 4 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleComponent;
