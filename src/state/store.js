import create from "zustand"

export const useStore = create((set, get) => ({
  //Login
  userInfo: {},
  setUserInfo: v => set({ userInfo: v }),

  //Main menu
  menuVisible: true,
  setMenuVisible: v => set({ menuVisible: v }),

  //Toolbar
  activeToolbarIndex: 0,
  setActiveToolbarIndex: v => set({ activeToolbarIndex: v }),

  //LightPanel
  sunInfo: {
    enabled: true,
    color: "#FFFDEC",
    intensity: 6,
  },
  setSunInfo: v => set({ sunInfo: v }),

  firstEmbientInfo: {
    enabled: true,
    color: "#ffe7df",
    intensity: 4,
  },
  setFirstEmbientInfo: v => set({ firstEmbientInfo: v }),

  secondEmbientInfo: {
    enabled: true,
    color: "#ffe7df",
    intensity: 4,
  },
  setSecondEmbientInfo: v => set({ secondEmbientInfo: v }),

  //EnvironmentPanel
  activeEnvironmentIndex: 0,
  setActiveEnvironmentIndex: v => set({ activeEnvironmentIndex: v }),
  envBackgroundEnabled: false,
  setEnvBackgroundEnabled: v => set({ envBackgroundEnabled: v }),
  currentOrientation: 0,
  setCurrentOrientation: v => set({ currentOrientation: v }),
  currentExposure: 0.6,
  setCurrentExposure: v => set({ currentExposure: v }),

  //Viewer3D
  loaderVisible: false,
  setLoaderVisible: v => set({ loaderVisible: v }),
  threeEngine: null,
  setThreeEngine: v => set({ threeEngine: v }),
  pressedKey: "",
  setPressedKey: v => set({ pressedKey: v }),

  //Configure Groups
  groupModel: null,
  setGroupModel: v => set({ groupModel: v }),
  selectedGroupNodes: {},
  setSelectedGroupNodes: v => set({ selectedGroupNodes: v }),
}))
