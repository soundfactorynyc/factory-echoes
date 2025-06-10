/**
 * Configuration interface for physics simulation settings
 */
export interface PhysicsConfig {
  /** 3D vector representing gravity force in x, y, z directions */
  gravity: [number, number, number];

  /** 3D vector representing wind force in x, y, z directions */
  windForce: [number, number, number];

  /** Coefficient of restitution (0 = no bounce, 1 = perfect bounce) */
  bounciness: number;

  /** Coefficient of friction (0 = no friction, 1 = maximum friction) */
  friction: number;

  /** Array of collision layer names for collision filtering */
  collisionLayers: string[];

  /** Lifetime of particles in seconds before they are removed */
  particleLife: number;

  /** Optional array of point attractors with position and strength */
  attractors?: Array<{
    /** 3D position of the attractor point */
    position: [number, number, number];
    /** Strength of attraction (positive) or repulsion (negative) */
    strength: number;
  }>;
}

/**
 * Default physics configuration with Earth-like gravity
 */
export const defaultPhysicsConfig: PhysicsConfig = {
  gravity: [0, -9.81, 0],
  windForce: [0, 0, 0],
  bounciness: 0.5,
  friction: 0.3,
  collisionLayers: ['default'],
  particleLife: 5.0
};

/**
 * Creates a configuration with specified parameters, filling in defaults for missing values
 * @param config Partial physics configuration
 * @returns Complete physics configuration
 */
export function createPhysicsConfig(config: Partial<PhysicsConfig>): PhysicsConfig {
  return {
    ...defaultPhysicsConfig,
    ...config
  };
}

/**
 * Validates a physics configuration
 * @param config Physics configuration to validate
 * @returns Array of error messages, empty if valid
 */
export function validatePhysicsConfig(config: PhysicsConfig): string[] {
  const errors: string[] = [];

  // Check value ranges
  if (config.bounciness < 0 || config.bounciness > 1) {
    errors.push('Bounciness must be between 0 and 1');
  }
  if (config.friction < 0 || config.friction > 1) {
    errors.push('Friction must be between 0 and 1');
  }
  if (config.particleLife <= 0) {
    errors.push('Particle life must be greater than 0');
  }

  // Check vector lengths
  if (config.gravity.length !== 3) {
    errors.push('Gravity must be a 3D vector');
  }
  if (config.windForce.length !== 3) {
    errors.push('Wind force must be a 3D vector');
  }

  // Check attractors if present
  if (config.attractors) {
    config.attractors.forEach((attractor, index) => {
      if (attractor.position.length !== 3) {
        errors.push(`Attractor ${index} position must be a 3D vector`);
      }
      if (!isFinite(attractor.strength)) {
        errors.push(`Attractor ${index} strength must be a finite number`);
      }
    });
  }

  // Check collision layers
  if (config.collisionLayers.length === 0) {
    errors.push('At least one collision layer must be defined');
  }
  if (new Set(config.collisionLayers).size !== config.collisionLayers.length) {
    errors.push('Collision layers must be unique');
  }

  return errors;
}

/**
 * Calculates the total force vector at a given position
 * @param config Physics configuration
 * @param position Current position [x, y, z]
 * @returns Resulting force vector [x, y, z]
 */
export function calculateForceAtPosition(
  config: PhysicsConfig,
  position: [number, number, number]
): [number, number, number] {
  // Start with gravity and wind
  const totalForce: [number, number, number] = [
    config.gravity[0] + config.windForce[0],
    config.gravity[1] + config.windForce[1],
    config.gravity[2] + config.windForce[2]
  ];

  // Add attractor forces if any
  if (config.attractors) {
    for (const attractor of config.attractors) {
      const dx = attractor.position[0] - position[0];
      const dy = attractor.position[1] - position[1];
      const dz = attractor.position[2] - position[2];
      
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      const distance = Math.sqrt(distanceSquared);
      
      if (distance > 0) {
        // Force decreases with square of distance
        const forceMagnitude = attractor.strength / distanceSquared;
        totalForce[0] += (dx / distance) * forceMagnitude;
        totalForce[1] += (dy / distance) * forceMagnitude;
        totalForce[2] += (dz / distance) * forceMagnitude;
      }
    }
  }

  return totalForce;
}
