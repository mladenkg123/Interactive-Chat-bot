import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import "./Particle.css";

const ParticleComponent = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Load slim particles configuration
    await loadSlim(engine);

    // Add custom shapes
    engine.addShape("flower", (ctx, _, radius) => {
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
    });
    engine.addShape("square", (ctx, _, radius) => {
      ctx.rect(0, 0, radius * 2, radius * 2);
      ctx.stroke();
    });
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: "#040c1c", 
          },
        },
        fpsLimit: 999,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
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
            value: "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.14, 
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1.25, 
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 1000, 
            },
            value: 80,
          },
          opacity: {
            value: 0.15,
          },
          shape: {
            type: ["circle", "flower", "square"],
          },
          size: {
            value: { min: 1, max: 4 }, // Reduced max size
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleComponent;
