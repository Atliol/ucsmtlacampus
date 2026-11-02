
export const CAMPUS_CONFIG = {
  location: {
    plusCodes: ["VWCC+R6X", "VWCC+GJP"],
    city: "Meiktila",
    latitude: 20.655801,
    longitude: 96.647711,
  },

  ground: {
    width: 180,
    depth: 180,
  },

  buildings: {
    main: {
      name: "Main Academic Building",
      position: { x: 0, z: -30 },
      width: 58,
      depth: 18,
      floors: 3,
      floorHeight: 4,
    },

    auditorium: {
      name: "Auditorium",
      position: { x: -42, z: 10 },
      width: 22,
      depth: 18,
      floors: 1,
      floorHeight: 6,
      rotationY: Math.PI / 2,
    },

    classroom: {
      name: "Classroom Block",
      position: { x: 42, z: 10 },
      width: 22,
      depth: 18,
      floors: 2,
      floorHeight: 4,
      rotationY: -Math.PI / 2,
    },

    computerLab: {
      name: "Computer Lab",
      position: { x: -40, z: -31 },
      width: 16,
      depth: 24,
      floors: 2,
      floorHeight: 4,
      rotationY: Math.PI / 2,
    },

    library: {
      name: "Library",
      position: { x: 40, z: -31 },
      width: 16,
      depth: 24,
      floors: 2,
      floorHeight: 4,
      rotationY: -Math.PI / 2,
    },

    canteen: {
      name: "Canteen",
      position: { x: -36, z: 43 },
      width: 18,
      depth: 16,
      floors: 1,
      floorHeight: 4,
      rotationY: Math.PI / 2,
    },

    administration: {
      name: "Administration",
      position: { x: 36, z: 43 },
      width: 18,
      depth: 16,
      floors: 2,
      floorHeight: 4,
      rotationY: -Math.PI / 2,
    },
  },

  courtyard: {
    x: 0,
    z: 22,
    width: 34,
    depth: 22,
  },

  sports: {
    volleyball: {
      x: 42,
      z: -63,
      width: 28,
      depth: 15,
    },
  },

  player: {
    x: 0,
    z: 55,
    speed: 5,
    runSpeed: 9,
  },
};
