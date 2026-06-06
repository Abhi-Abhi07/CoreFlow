import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "User",
  initialState: {
    user: null,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 2, queueNo: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, queueNo: 2 },
      { id: 'P3', arrivalTime: 2, burstTime: 9, priority: 3, queueNo: 3 },
    ],
    algorithm: 'Round Robin (RR)',
    timeQuantum: 2,
    contextSwitch: 1,
    mlqAlgorithms: {
      q1: 'Round Robin (RR)',
      q2: 'First-Come, First-Served (FCFS)',
      q3: 'Shortest Job First (SJF)'
    },
    mlfqAlgorithms: {
      q1: 'Round Robin (RR)',
      q2: 'First-Come, First-Served (FCFS)',
      q3: 'Shortest Job First (SJF)'
    }
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setGlobalProcesses: (state, action) => {
      state.processes = action.payload;
    },
    setGlobalAlgorithm: (state, action) => {
      const selectedAlgo = action.payload;
      state.algorithm = selectedAlgo;

      // Inject clean operational fallbacks for queue and priority metrics
      if (
        selectedAlgo.toLowerCase().includes("priority") || 
        selectedAlgo.toLowerCase().includes("queue") || 
        selectedAlgo.toLowerCase().includes("mlq") ||
        selectedAlgo.toLowerCase().includes("mlfq")
      ) {
        state.processes = state.processes.map(proc => ({
          ...proc,
          priority: proc.priority !== undefined ? proc.priority : Math.floor(Math.random() * 10) + 1,
          queueNo: proc.queueNo !== undefined ? proc.queueNo : 1
        }));
      }
    },
    setGlobalTimeQuantum: (state, action) => {
      state.timeQuantum = action.payload;
    },
    setGlobalContextSwitch: (state, action) => {
      state.contextSwitch = action.payload;
    },
    setMlqQueueAlgorithm: (state, action) => {
      const { queueKey, algo } = action.payload;
      if (!state.mlqAlgorithms) {
        state.mlqAlgorithms = { q1: 'Round Robin (RR)', q2: 'First-Come, First-Served (FCFS)', q3: 'Shortest Job First (SJF)' };
      }
      state.mlqAlgorithms[queueKey] = algo;
    },
    setMlfqQueueAlgorithm: (state, action) => {
      const { queueKey, algo } = action.payload;
      if (!state.mlfqAlgorithms) {
        state.mlfqAlgorithms = { q1: 'Round Robin (RR)', q2: 'First-Come, First-Served (FCFS)', q3: 'Shortest Job First (SJF)' };
      }
      state.mlfqAlgorithms[queueKey] = algo;
    }
  }
});

export const { 
  setUser, 
  setGlobalProcesses, 
  setGlobalAlgorithm, 
  setGlobalTimeQuantum, 
  setGlobalContextSwitch,
  setMlqQueueAlgorithm,
  setMlfqQueueAlgorithm
} = userSlice.actions;
export default userSlice.reducer;