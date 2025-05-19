import { defineStore } from "pinia";
import type { IceTransportPolicy } from "~/types";

export type State = {
  iceTransportPolicy: IceTransportPolicy;
  preferTcp: boolean;
  videoCodecs: string[];
  canTrickleIce: boolean;
  iceHostCandidates: boolean;
  godMode: boolean; // enables additional low-level control elements in the UI
  replication: number;
  loadProfile: LoadProfile;
};

export type LoadProfile = {
  delay: string;
  variance: number;
  batchSize: number;
  batchWindow: string;
};

type Actions = {
  setIceTransportPolicy: (iceTransportPolicy: IceTransportPolicy) => void;
  setPreferTcp: (preferTcp: boolean) => void;
  setVideoCodecs: (videoCodecs: string[]) => void;
  setCanTrickleIce: (canTrickleIce: boolean) => void;
  setGodMode: (godMode: boolean) => void;
  setIceHostCandidates: (iceHostCandidates: boolean) => void;
  setReplication: (replication: number) => void;
  setLoadProfile: (loadProfile: Partial<LoadProfile>) => void;
};

const DEFAULT_SETTINGS = {
  iceTransportPolicy: "relay" as IceTransportPolicy,
  preferTcp: true,
  videoCodecs: ["H264"],
  canTrickleIce: true,
  iceHostCandidates: false,
  godMode: false,
  replication: 3,
  loadProfile: {
    delay: '250ms',
    variance: 0.5,
    batchSize: 10,
    batchWindow: '30s'
  },
};

export const useSettingsStore = defineStore<"settings", State, {}, Actions>(
  "settings",
  {
    state: () => ({
      ...DEFAULT_SETTINGS,
    }),
    actions: {
      setIceTransportPolicy(iceTransportPolicy: IceTransportPolicy) {
        this.iceTransportPolicy = iceTransportPolicy;
      },
      setPreferTcp(preferTcp: boolean) {
        this.preferTcp = preferTcp;
      },
      setVideoCodecs(videoCodecs: string[]) {
        this.videoCodecs = videoCodecs;
      },
      setCanTrickleIce(canTrickleIce: boolean) {
        this.canTrickleIce = canTrickleIce;
      },
      setGodMode(godMode: boolean) {
        this.godMode = godMode;
      },
      setIceHostCandidates(iceHostCandidates: boolean) {
        this.iceHostCandidates = iceHostCandidates;
      },
      setReplication(replication: number) {
        if (replication > 0) {
          this.replication = replication;
        } else {
          console.warn(`Invalid replication value: ${replication}. Clamping to minimum value of 1.`);
          this.replication = 1;
        }
      },
      setLoadProfile(loadProfile: Partial<LoadProfile>) {
        this.loadProfile = { ...this.loadProfile, ...loadProfile };
      },
    },
  }
);
